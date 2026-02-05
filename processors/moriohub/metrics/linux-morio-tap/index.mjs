import { metricsProcessor } from '../../lib.mjs'

/*
 * Morio stream processors to handle metrics data from the linux-morio-tap module
 * There is only one dataset in this module (json) so we keep the handler in this file.
 */
const proc = [metricsProcessor({ module: 'linux-morio-tap', dataset: 'json', handler, })]
console.log(proc)
export default [metricsProcessor({ module: 'linux-morio-tap', dataset: 'json', handler, })]

/*
 * Caches json metricsets. Does not (currently) eventify.
 */
function handler (params) {
  if (params.settings.cache) {
    const { data, tools } = params

    // Handle tap metrics
    if (data.http?.morio?.tap) return tools.cache.metricset(data.http.morio.tap, params)

    // Log unhandled metricset
    tools.note("Morio Tap unhandled metricset", data)
  }
}

