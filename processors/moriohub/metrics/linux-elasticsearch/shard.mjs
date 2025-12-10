/*
 * Eventifies shard metrics. No caching (currently).
 */
export default function shard (params) {
  if (params.settings.eventify) {
    // Default caching
    //params.tools.cache.metricset(params.data.elasticsearch?.node?.jvm?.memory, params)
  }
}


