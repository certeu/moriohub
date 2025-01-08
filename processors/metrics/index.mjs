import modules from "./modules/index.mjs"

/*
 * A Morio stream processor to handle metrics data
 *
 * This is designed to handle data in the 'metrics' topic, which
 * typically holds data generated by Metricbeat agents,
 * although it can also process other data if it's well-formatted.
 *
 * This method will be called for ever incoming message on the metrics topic
 *
 * @param {object} data - The data from RedPanda
 * @param {obectt} tools - The tools object
 * @param {string} topic - The topic the data came from
 */
export default function metricsStreamProcessor (data, tools, topic) {
  /*
   * Hand over to module-specific logic
   */
  if (data?.morio?.module && typeof modules[data.morio.module] === 'function') {
    let result
    try {
      result = modules[data.morio.module](data, tools)
      if (result) tools.cache.metricset(result, data, config)
    }
    catch(err) {
      tools.note(`[metrics] Error in module logic`, { err, data })
    }
  }
  else if (config.log_unhandled) {
    tools.note(`[metrics] Cannot handle message`, data)
  }

  /*
   * Metricset: throughput
   */
  //if (data.metricset?.name === 'throughput') tools.cache.metricset(data.morio.tap.throughput, data, config)
}

/*
 * This is used for both the UI and to generate the default settings
 */
export const info = {
  docs: 'https://morio.it/docs/FIXME',
  title: 'Metrics stream processor',
  about: `This stream processor will process metrics data flowing through your Morio collector.

It can cache recent metrics, as well as enventify them for event-driven automation.
It also supports dynamic loading of module-specific logic.`,
  settings: {
    enabled: {
      title: 'Enable metrics stream processor',
      dflt: true,
      type: 'list',
      list: [
        {
          val: false,
          label: 'Disabled',
          about: 'Select this to completely disabled this stream processor',
        },
        {
          val: true,
          label: 'Enabled',
          about: 'Select this to enable this stream processor',
        },
      ]
    },
    topics: {
      dflt: ['metrics'],
      title: 'List of topics to subscribe to',
      about: `Changing this from the default \`metrics\` is risky`,
      type: 'labels',
    },
    cache: {
      dflt: true,
      title: 'Cache metrics data',
      type: 'list',
      list: [
        {
          val: false,
          label: 'Do not cache metrics (disable)',
        },
        {
          val: true,
          label: 'Cache recent metrics',
          about: 'Caching metrics allows consulting them through the dashboards provided by Morio&apos;s UI service'
        },
      ],
    },
    ttl: {
      dflt: 1,
      title: 'Maxumum age of cached metrics',
      about: 'Metrics in the cache will expire after this amount of time',
      labelBL: 'In hours',
      type: 'number'
    },
    cap: {
      dflt: 300,
      title: 'Maximum number of sets per metricset',
      about: 'This is a hard safety limit regardless of cache age or polling interval.',
      type: 'number'
    },
    eventify: {
      dflt: true,
      title: 'Eventify metrics',
      type: 'list',
      list: [
        {
          val: false,
          label: 'Do not eventify metrics (disable)',
        },
        {
          val: true,
          label: 'Auto-create events based on metrics',
          about: 'Eventifying metrics allows for event-driven automation and monitoring based on audit information',
        },
      ],
    },
  }
}
