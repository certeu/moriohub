/*
 * Caches healthcheck metricset. Does not (currently) eventify.
 */
export default function healthcheck (params) {
  if (params.settings.cache) {
    // Default caching
    //params.tools.cache.metricset(params.data.system.load, params)
  }
}
