import { rules } from './_escalation-rules.mjs'

export function escalate (params) {
  const { data, tools, settings } = params

  // We filter on type. Without a type, we won't escalate
  // but create a note because this should not happen
  const type = data.morio?.event?.type || false
  if (!type) return tools.cache.note(`Event does not have a type`, data)

  // We rely on the event hash to escalate, so ensure it's present
  if (!data.morio.event.hash) return tools.cache.note(`Event does not have a hash`, data)

  // Skip if the event type is included in the 'never' set
  if (rules.never && rules.never.includes(data.morio.event.type)) return

  // Check if we can match the event type against the 'on' set
  if (rules.on[type]) {
    // If it's an array of rules, process each of them
    if (Array.isArray(rules.on[type])) {
      for (const rule of rules.on[type]) handleEscalation(params, rule)
    }
    // If it's a simple rule, process it
    else handleEscalation(params, rules.on[type])

    // Return, since it's not unhandled
    return
  }

  // Deal with unhandled events, if needed
  if (rules.unhandled) handleEscalation(params, rules.unhandled)
}

/*                                                                                                                            [4/1894]
 * This handles the actual escalation.
 * There's a number of rules settings we need to handle:
 * - on: Run a function to see if we should escalate
 * - debounce: Suppress repititions in a given time window
 * - backoff: Suppress repititions by backing off exponentially
 *
 * To make this possible, we need to know whether this
 * this is the first series in an event, or a repitition.
 * We use the cache to keep track of this.
 *
 * @param {object} params - All params passed to the event processor
 * @param {object} rule - The escalation rule for this dataset
 */
async function handleEscalation(params, rule) {
  // Desctructure params
  const { tools, data } = params


  // Step 1: Grab the event hash and timestamp
  const hash = params.data.morio.event.hash
  const timestamp = tools.extract.timestamp(data)

  // Support debug
  const debug = debugHelper(params, hash)
  if (rule.debug) debug.start()

  // Step 2: Cache the event
  const prefix = `event|${hash}`
  if (rule.debug) debug.msg(`Caching event data`)
  await tools.valkey
    .pipeline()
    .set(`${prefix}.data`, tools.stringify({ ...data, timestamp }))
    .set(`${prefix}.first_timestamp`, timestamp, "NX") // Set only if unset
    // Note that for debouncing, we use the current time, not the event time
    .set(`${prefix}.debounce_timestamp`, tools.time.ms2s(tools.time.now()), "NX") // Set only if unset
    .set(`${prefix}.last_timestamp`, timestamp)
    .incr(`${prefix}.count`)
    .exec()

  // Step 3: Is there an 'on' method?
  const count = await tools.valkey.get(`${prefix}.count`)
  if (rule.debug) debug.msg(`Repetition count for this event: ${count}`)
  if (rule.on && typeof rule.on === 'function') {
    if (rule.debug) debug.msg(`Running 'on' handler`)
    if (!rule.on({ ...params, count, rule })) {
      if (rule.debug) {
        debug.msg(`The on-handler returned falsy, won't process this event any futher`)
        debug.end()
      }

      return
    }
  }

  // Step 4: Do we need to debounce this?
  if (rule.debounce) {
    if (rule.debug) debug.msg(`Event needs to be debounced, window is ${rule.debounce} seconds`)
    const debounce_timestamp = await tools.valkey.get(`${prefix}.debounce_timestamp`)
    const debounce_delta = (tools.time.ms2s(tools.time.now()) - debounce_timestamp > rule.debounce)
    if (rule.debug) debug.msg(`Debounce delta: ${debounce_delta}`)
    if (tools.time.ms2s(tools.time.now()) - debounce_timestamp > rule.debounce) {
      if (rule.debug) debug.msg(`Debounce window has expired, resetting timer`)
      await tools.valkey.set(`${prefix}.debounce_timestamp`, tools.time.ms2s(tools.time.now()))
    }
    // Debounce window hasn't expired, return early
    else {
      if (rule.debug) {
        debug.msg(`Debouncing event, won't process this event any futher`)
        debug.end()
      }

      return
    }
  }

  // Step 5: Do we need to back off?
  if (rule.backoff) {
    if (rule.debug) debug.msg(`Event requires backoff`)
    if (backoff(count)) {
      if (rule.debug) {
        debug.msg(`Backing off, as count is ${count}`)
        debug.end()
      }
      return
    }
    else if (rule.debug) debug.msg(`Not backing off, as count is ${count}`)
  }


  // Step 6: Escalate
  const escalation = {
    context: data.morio.event.context,
    data,
    host: tools.extract.host(data),
    tags: rule.tags || [],
    time: timestamp,
    title: `[${count}x] ${data.morio.event.title}`,
    md_title: `[${count}x] ${data.morio.event.md_title}`,
    type: data.morio.event.type,
  }
  if (rule.alarm) {
          if (rule.debug) debug.msg('Producing an larm', escalation)
         tools.produce.alarm(escalation)
  }
  if (rule.alert) {
          if (rule.debug) debug.msg('Producing an lert', escalation)
          tools.produce.alert(escalation)
  }
  if (rule.notify) {
          if (rule.debug) debug.msg('Producing a notification', escalation)
          tools.produce.notification(escalation)
  }
  if (rule.note) {
          if (rule.debug) debug.msg('Caching a note', escalation)
          tools.cache.note(escalation.title, escalation)
  }

  // Step 7: Execute
  if (rule.call && typeof rule.call === 'function') {
          if (rule.debug) debug.msg(`Running 'call' handler`, data)
          rule.call({ ...params, count, rule, escalation })
  }

  if (rule.debug) debug.end()
}

/*
 * Exponential backoff check
 *
 * This will return false (do not backoff) on:
 * 1,2,4,8,16,32,64,128,256,512,1024,2048,...
 *
 * @param {number} count - The number of repititions
 * @return {bool} backoff - True when we should back off, false if not
 */
function backoff(count) {
  // This uses a bitwise AND for efficiency
  return (count && !(count & (count - 1))) ? false : true
}

/*
 * A helper method for debugging event processors
 */
function debugHelper (params, hash) {
  const { tools, data } = params
  const id = hash.slice(0,8)

  return {
    start: (msg) => tools.cache.note(`[${id}] Start event processor debug`, data),
    msg: (msg) => tools.cache.note(`[${id}] ${msg}`, data),
    end: (msg) => tools.cache.note(`[${id}] End event processor debug`, data),
  }
}
