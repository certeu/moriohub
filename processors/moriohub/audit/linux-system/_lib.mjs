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
    // Topic, module, and dataset
    topic,
    module, 
    dataset, 
    // Source event
    sid: `audit.${tools.extract.id(data)}`,
  }
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
