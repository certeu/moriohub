/*
 * Caches cluster_status metricset, and eventifies.
 */
export default function cluster_status (params) {
  if (params.settings.cache) {
    // Default caching
    //params.tools.cache.metricset({ status: params.data.elasticsearch?.cluster?.stats?.status }, params, 'cluster_status')
  }
}
