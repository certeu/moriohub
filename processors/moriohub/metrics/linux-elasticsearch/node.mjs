/*
 * Caches node metricset. Does not (currently) eventify.
 */
export default function node (params) {
  if (params.settings.cache) {
    // Default caching
    params.tools.cache.metricset(params.data.elasticsearch?.node?.jvm?.memory, params)
  }
}
