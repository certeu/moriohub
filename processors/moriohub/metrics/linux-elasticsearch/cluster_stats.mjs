/*
 * Caches cluster_stats metricset. Does not (currently) eventify.
 */
export default function cluster_stats (params) {
  if (params.settings.cache) {
    // Default caching
    //params.tools.cache.metricset(params.data.system.load, params)
  }
}
