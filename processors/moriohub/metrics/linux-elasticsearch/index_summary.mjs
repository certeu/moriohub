/*
 * Caches index_summary metricsets. Does not (currently) eventify.
 */
export default function index_summary (params) {
  if (params.settings.cache) {
    // Default caching
    params.tools.cache.metricset(params.data.elasticsearch?.index?.summary, params)
  }
}
