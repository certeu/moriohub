/*
 * Caches pressure metricset. Does not (currently) eventify.
 */
export default function load (params) {
  if (params.settings.cache) {
    // Default caching
    //params.tools.cache.metricset(params.data.system.load, params)
    // Top-20 caching for load1, load5, and load15
    //for (const i of ["1", "5", "15"]) {
    //  params.tools.cache.top(`metric|top-linux-load${i}`,[ params.data.host.id, params.data.system.load.norm[i] ])
    //}
  }
}
