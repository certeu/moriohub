/*
 * This helper method keeps things DRY
 *
 * @param {string} dataset - The dataset this config is for
 * @param {function} processor - The function that implements the stream processing logic
 * @return {object} spobj - The stream processor object
 */
export function config (dataset, handler) {
  return {
    id: `moriohub_logs_linux-system_${dataset}`,
    info: `This stream processor plugin will process log data from the ${dataset} dataset of the linux-system module.`,
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
      topics: ['logs'],
      modules: ['linux-system'],
      datasets: [dataset],
      cache: false,
      eventify: {
        dflt: true,
        title: `Eventify ${dataset} log data`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not eventify ${dataset} log data (disable)`,
          },
          {
            val: true,
            label: `Auto-create events based on ${dataset} log data`,
            about: `Eventifying ${dataset} log data is used for event-driven automation and monitoring at CERT-EU`,
          },
        ],
      },
    },
    handler,
  }
}
