/*
 * We keep the processor for each metricset in their own file
 * That makes it easy for people to override an implementation
 * by replacing only that specific file
 */
import diskio from './diskio.mjs'
import filesystem from './filesystem.mjs'
import load from './load.mjs'
import memory from './memory.mjs'
import network_summary from './network_summary.mjs'
import process_summary from './process_summary.mjs'
import socket_summary from './socket_summary.mjs'
// Allow extra imports here
import extra from './_extra.mjs'

/*
 * Morio stream processors to handle metrics from the linux-system module
 * We have one processor per metricset
 */
export default Object.entries({
  diskio,
  filesystem,
  load,
  memory,
  network_summary,
  process_summary,
  socket_summary,
  ...extra,
}).map(([set, handler]) => typeof handler === 'function'
  ? config(set, handler)
  : undefined
)


/*
 * This helper method keeps things DRY
 *
 * @param {string} metricset - The metricset this config if for
 * @param {function} processor - The function that implements the stream processing logic
 * @return {object} spobj - The stream processor object
 */
function config (metricset, handler) {
  return {
    id: `moriohub_metrics_linux-system_${metricset}`,
    info: `This stream processor plugin will process metrics data from the ${metricset} metricset of the linux-system module.`,
    settings: {
      topics: ['metrics'],
      modules: ['linux-system'],
      datasets: [metricset],
      cache: {
        dflt: true,
        title: `Cache ${metricset} metrics data`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not cache ${metricset} metrics data (disable)`,
          },
          {
            val: true,
            label: `Cache recent ${metricset} metrics`,
            about: 'Caching metrics allows consulting them through the dashboards provided by Morio&apos;s UI service'
          },
        ],
      },
      cap: {
        dflt: 250,
        title: `Maximum number of sets per ${metricset} metricset`,
        type: 'number'
      },
      eventify: {
        dflt: true,
        title: `Eventify ${metricset} metrics`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not eventify ${metricset} metrics data (disable)`,
          },
          {
            val: true,
            label: `Auto-create events based on ${metricset} metrics`,
            about: `Eventifying ${metricset} metrics allows for event-driven automation and monitoring based on ${metricset} data`,
          },
        ],
      },
    },
    handler,
  }
}
