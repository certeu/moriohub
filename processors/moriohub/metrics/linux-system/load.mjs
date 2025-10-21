/*
 * Caches load metricset. Does not (currently) eventify.
 */
export default function load (params) {
  if (params.settings.cache) return params.tools.cache.metricset(params.data.system.load, params)
}
