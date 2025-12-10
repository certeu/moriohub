/*
 * Eventifies index_recovery metrics. No caching (currently).
 */
export default function index_recovery (params) {
  if (params.settings.eventify) {
    // Default caching
    //params.tools.cache.metricset(params.data.elasticsearch?.node?.jvm?.memory, params)
  }
}



