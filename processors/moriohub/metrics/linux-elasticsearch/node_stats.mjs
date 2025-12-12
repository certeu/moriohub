/*
 * Caches node_stats metricset. Does not (currently) eventify.
 */
export default function node_stats (params) {
  if (params.settings.cache) {
    if (params.data.elasticsearch?.node?.stats) {
      // Default caching
      params.tools.cache.metricset(params.data.elasticsearch.node.stats, params)
    }
    else params.tools.note(`No elasticsearch.node.stats found in metrics`, params.data)
  }
}
