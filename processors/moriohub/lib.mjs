/*
 * Helper method to keep things DRY when setting up a log processor
 *
 * @param {object} params - All parameters passed as an object
 * @param {string} params.module - The module name
 * @param {function} params.handler - The processor handler method
 * @param {string} params.idSuffic - An optional suffix to the processor ID, required if a module has multiple processors
 * @param {array} params.topics - The array of topics to subscribe to. Defaults to ['logs']
 * @param {array} params.datasets - An optional array of datasets to subscribe to
 */
export function logsProcessor({
  module = false, // The module name
  handler = false, // The handler method
  idSuffix = '', // Optional suffix for the processor ID
  topics = ['logs'], // The topics to subscribe to
  datasets = false, // The datasets to subscribe to
}) {
  if (!module || !handler) return false

  const config = {
    id: `moriohub_logs_${module}${idSuffix}`,
    info: `This stream processor plugin will cache log data from the ${module} module.`,
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
      topics,
      modules: [ module ],
      cache: {
        dflt: true,
        title: 'Cache log data',
        type: 'list',
        list: [
          {
            val: false,
            label: 'Do not cache log data (disable)',
          },
          {
            val: true,
            label: 'Cache recent log data',
            about: 'Caching log data allows consulting it through the dashboards provided by Morio&apos;s UI service'
          },
        ],
      },
      cap: {
        dflt: 25,
        title: 'Maximum number of log lines per logset',
        about: 'This limites the log lines stored per logset.',
        labelBL: 'In log lines',
        type: 'number'
      },
    },
    handler,
  }

  // Add datasets of any were passed
  if (datasets) config.datasets = datasets

  return config
}


/*
 * Helper method to keep things DRY when setting up a metrics processor
 *
 * @param {object} params - All parameters passed as an object
 * @param {string} params.module - The module name
 * @param {string} params.dataset - The dataset to subscribe to
 * @param {function} params.handler - The processor handler method
 * @param {array} params.topics - The array of topics to subscribe to. Defaults to ['metrics']
 */
export function metricsProcessor({
  module = false, // The module name
  dataset = false, // The dataset to subscribe to
  handler = false, // The handler method
  topics = ['metrics'], // The topics to subscribe to
}) {
  if (!module || !dataset || !handler) return false

  return {
    id: `moriohub_metrics_${module}_${dataset}`,
    info: `This stream processor plugin will process metrics data from the ${dataset} dataset of the ${module} module.`,
    settings: {
      topics,
      modules: [ module ],
      datasets: [ dataset ],
      cache: {
        dflt: true,
        title: `Cache ${dataset} metrics data`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not cache ${dataset} metrics data (disable)`,
          },
          {
            val: true,
            label: `Cache recent ${dataset} metrics`,
            about: 'Caching metrics allows consulting them through the dashboards provided by Morio&apos;s UI service'
          },
        ],
      },
      cap: {
        dflt: 250,
        title: `Maximum number of sets per ${dataset} metricset`,
        type: 'number'
      },
      eventify: {
        dflt: true,
        title: `Eventify ${dataset} metrics`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not eventify ${dataset} metrics data (disable)`,
          },
          {
            val: true,
            label: `Auto-create events based on ${dataset} metrics`,
            about: `Eventifying ${dataset} metrics allows for event-driven automation and monitoring based on ${dataset} data`,
          },
        ],
      },
    },
    handler,
  }
}

