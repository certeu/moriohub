/*
 * This helper method keeps things DRY
 *
 * @param {string} auditset - The auditset this config if for
 * @param {function} processor - The function that implements the stream processing logic
 * @return {object} spobj - The stream processor object
 */
export function config (auditset, handler) {
  return {
    id: `moriohub_audit_linux-system_${auditset}`,
    info: `This stream processor plugin will process audit data from the ${auditset} auditset of the linux-system module.`,
    settings: {
      enabled: {
        dflt: true,
        title: `Enable this stream processor`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not enable this stream processor (disable)`,
          },
          {
            val: true,
            label: `Enable this stream processor (disable)`,
          },
        ],
      },
      topics: ['audit'],
      modules: ['linux-system'],
      datasets: [auditset],
      cache: {
        dflt: true,
        title: `Cache ${auditset} audit data`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not cache ${auditset} audit data (disable)`,
          },
          {
            val: true,
            label: `Cache recent ${auditset} audit data`,
            about: 'Caching audit data allows consulting them through the dashboards provided by Morio&apos;s UI service'
          },
        ],
      },
      cap: {
        dflt: 250,
        title: `Maximum number of sets per ${auditset} auditset`,
        type: 'number'
      },
      eventify: {
        dflt: true,
        title: `Eventify ${auditset} audit data`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not eventify ${auditset} audit data (disable)`,
          },
          {
            val: true,
            label: `Auto-create events based on ${auditset} audit data`,
            about: `Eventifying ${auditset} audit data allows for event-driven automation and monitoring`,
          },
        ],
      },
    },
    handler,
  }
}

/**
 * Helper method to extract common audit data
 *
 * @param {object} parms - The data passed to the handler method
 * @return {object} summary - The summary object
 */
export function auditSummary ({ data, tools, topic, module, dataset }) {
  const summary = {
    // Time of the event
    time: tools.extract.timestamp(data),
    // Host
    host: tools.extract.host(data),
    hostname: tools.extract.hostname(data),
    // Topic, module, and dataset
    topic,
    module,
    dataset,
    // Source event
    sid: `audit.${tools.extract.id(data)}`,
  }
  // Context
  summary.context = tools.create.context(topic, module, dataset, summary.host)
  // User
  if (data.user) {
    summary.user = data.user
    // This is too chatty
    for (const field of ['audit', 'selinux', 'saved', 'filesystem']) {
      if (summary.user[field]) delete (summary.user[field])
    }
  }
  // Process
  if (data.process) summary.process = data.process
  // (auditd) result
  if (typeof data.auditd?.result !== 'undefined') summary.result = data.auditd.result
  // (auditd) data
  if (data.auditd?.data) summary.data = data.auditd.data

  return summary
}

export function userSessionEvent (params) {
  const { data, tools, settings } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `${params.dataset}: ${data.user?.name}`,
    md_title: `${params.dataset}: ${tools.link.md.audit.user(data.user?.name)}`,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}
  if (data.user?.effective?.name) {
    evt.title += ` (as: ${data.user?.effective?.name})`
    evt.md_title += ` (as: ${tools.link.md.audit.user(data.user?.effective?.name)}`
  }
  evt.title += ` on ${summary.hostname} (${tools.shortUuid(summary.host)}) (tty: ${summary.data?.terminal})`
  evt.md_title += ` on ${summary.hostname} (${tools.link.md.inventory.host(summary.host, tools.shortUuid(summary.host))} (tty: ${summary.data?.terminal})`

  return evt
}

export function groupLifecycleEvent (params) {
  const { data, tools, settings } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `${params.dataset}: ${data.group?.name} (id: ${data.group.id})`,
    md_title: `${params.dataset}: ${data.group?.name} (id: ${data.group.id})`,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}
  if (data.user?.name) {
    evt.title += ` (by: ${data.user?.name})`
    evt.md_title += ` (by: ${tools.link.md.audit.user(data.user?.name)}`
  }
  evt.title += ` on ${summary.hostname} (${tools.shortUuid(summary.host)}) (tty: ${summary.data?.terminal})`
  evt.md_title += ` on ${summary.hostname} (${tools.link.md.inventory.host(summary.host, tools.shortUuid(summary.host))} (tty: ${summary.data?.terminal})`

  return evt
}

/*
 * A user lifecycle event is what is used when a user is added/removed
 * with high-level tools that properly notify the auditing system.
 * This is used by:
 * - added-user-account
 * - removed-user-account
 */
export function userLifecycleEvent (params) {
  const { data, tools, settings } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `${params.dataset}: New user created (uid: ${data.user.target.id})`,
    md_title: `${params.dataset}: New user created (uid: ${data.user.target.id})`,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}
  evt.title += ` on ${summary.hostname} (${tools.shortUuid(summary.host)})`
  evt.md_title += ` on ${summary.hostname} (${tools.link.md.inventory.host(summary.host, tools.shortUuid(summary.host))}`
  if (data.user?.name) {
    evt.title += ` (by: ${data.user?.name})`
    evt.md_title += ` (by: ${tools.link.md.audit.user(data.user?.name)}`
  }

  return evt
}

/*
 * A user discovery event is what is used when a user changed is discoveread
 * (by scanning /etc/passwd for example)
 * In this case, we have info about the account, but not about who did it.
 * This happens when users are added via low-level tools.
 * This is used by:
 * - user_added
 * - user_removed
 */
export function userDiscoveryEvent (params) {
  const { data, tools, settings } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `${params.dataset}: ${data.message} on ${summary.hostname} (${tools.shortUuid(summary.host)})`,
    md_title: `${params.dataset}: ${data.message} on ${summary.hostname} (${tools.link.md.inventory.host(summary.host, tools.shortUuid(summary.host))}`,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}

  return evt
}


