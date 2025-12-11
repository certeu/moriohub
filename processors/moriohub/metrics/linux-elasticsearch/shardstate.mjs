/*
 * Cached shardstate metrics.
 * Note that these are not metrics provided by the default elasticsearch
 * module in metricbeat. This is specific to the morio module for elasticsearch.
 */
export default function shardstate (params) {
  if (params.settings.cache) {
    // Default caching
    //params.tools.cache.metricset(params.data.elasticsearch?.node?.jvm?.memory, params)
  }
  if (params.settings.eventify) {
  }
}


