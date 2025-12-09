/*
 * Caches node_stats metricset. Does not (currently) eventify.
 */
export default function node_stats (params) {
  if (params.settings.cache) {
    // Default caching
    params.tools.cache.metricset(params.data.elasticsearch.node.stats, params)
  }
}
