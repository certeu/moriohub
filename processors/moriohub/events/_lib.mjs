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
      /*
       * In this case, we will call the escalation handler more than
       * once for the same event. However, things like caching the
       * event or counting its repetitions should only happen once
       * for each event. Which is why we define this 'first' variable
       * and pass it to handleEscalation so it can rely on it to do
       * things once once if first is true
       */
      let first = true
      for (const rule of rules.on[type]) {
        handleEscalation(params, rule, first)
        first = false
      }
    }
    // If it's a simple rule, process it
    else handleEscalation(params, rules.on[type])

    // Return, since it's not unhandled
    return
  }

  // Deal with unhandled events, if needed
  if (rules.unhandled) handleEscalation(params, rules.unhandled)
}

/*
 * This handles the actual escalation.
 *
 * @param {object} params - All params passed to the event processor
 * @param {object|function} rule - The escalation rule for this dataset
 * @param {boolean} first - Will be true if this is the first time processing this message
 */
async function handleEscalation(params, rule, first=true) {
  // Desctructure params
  const { tools, data } = params

  // Grab the event hash and timestamp
  const hash = params.data.morio.event.hash
  const timestamp = tools.extract.timestamp(data)

  // Detect repetitions
  const prefix = `event|${hash}`
  const reps = first
    ? await tools.valkey.incr(`${prefix}.reps`)
    : await tools.valkey.get(`${prefix}.reps`)
  tools.set(data, 'morio.event.reps', reps)

  // Allow for passing in a function as rule
  if (typeof rule === 'function') rule = rule({ ...params, data, reps, rule, first })

  // Skip if rule is falsy
  if (!rule) return

  // Support debug
  const debug = debugHelper(params, hash)
  if (rule.debug) debug.start()

  // Step 1: Cache the event (first only)
  if (first) {
    const expire = rule.expire ? ['EX', rule.expire] : []
    if (rule.debug) {
      debug.msg(`Caching event data`)
      if (expire.length > 0) debug.msg(`Event will expire after ${expire[1]} seconds`)
      else debug.msg(`Event will not expire`)
    }
    await tools.valkey
      .pipeline()
      .set(`${prefix}.data`, tools.stringify({ ...data, timestamp }), ...expire)
      .set(`${prefix}.first_timestamp`, timestamp, "NX", ...expire) // Set only if unset
      .set(`${prefix}.last_timestamp`, timestamp, ...expire)
      .exec()
    if (rule.debug) debug.msg(`Reps for this event: ${reps}`)
  }

  // Step 2: Handle an 'on' method
  if (rule.on && typeof rule.on === 'function') {
    if (rule.debug) debug.msg(`Running 'on' handler`)
    if (!rule.on({ ...params, data, reps, rule })) {
      if (rule.debug) {
        debug.msg(`The on-handler returned falsy, won't process this event any futher`)
        debug.end()
      }

      return                                                                                                                              }                                                                                                                                   }
  // Step 3: Do we need to back off?
  if (rule.backoff) {
    if (rule.debug) debug.msg(`Event requires backoff`)
    if (backoff(reps)) {
      if (rule.debug) {
        debug.msg(`Backing off, as reps is ${reps}`)
        debug.end()
      }
      return
    }
    else if (rule.debug) debug.msg(`Not backing off, as reps is ${reps}`)
  }

  // Step 4: Escalate                                                                                                                   const escalation = {
    context: data.morio.event.context,
    data,
    host: tools.extract.host(data),
    tags: rule.tags || [],
    time: timestamp,
    title: `[${reps}x] ${data.morio.event.title}`,
    md_title: `[${reps}x] ${data.morio.event.md_title}`,
    type: data.morio.event.type,
    reps,
  }
  if (rule.alarm) {
    if (rule.debug) debug.msg('Producing an alarm', escalation)
    tools.produce.alarm(escalation)
  }
  if (rule.alert) {
    if (rule.debug) debug.msg('Producing an alert', escalation)
    tools.produce.alert(escalation)
  }
  if (rule.notify) {
    if (rule.debug) debug.msg('Producing a notification', escalation)
    tools.produce.notification(escalation)
  }                                                                                                                                     if (rule.note) {
    if (rule.debug) debug.msg('Caching a note', escalation)
    tools.cache.note(escalation.title, escalation)
  }

  // Step 5: Execute call handler
  if (rule.call && typeof rule.call === 'function') {
    if (rule.debug) debug.msg(`Running 'call' handler`, data)
    rule.call({ ...params, reps, rule, escalation })
  }

  if (rule.debug) debug.end()
}

/*
 * Exponential backoff check
 *                                                                                                                                     * This will return false (do not backoff) on:
 * 1,2,4,8,16,32,64,128,256,512,1024,2048,...
 *
 * @param {number} reps - The number of repititions
 * @return {bool} backoff - True when we should back off, false if not
 */
function backoff(reps) {
  // This uses a bitwise AND for efficiency
  return (reps && !(reps & (reps - 1))) ? false : true
}

/*
 * Debug helper
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
