/*
 * Caches diskio metricset. Does not (currently) eventify.
 */
export default function diskio (params) {
  if (!params.settings.cache) return false

  // This metricset generates different events
  if (params.data.system?.diskio) params.tools.cache.metricset(params.data.system.diskio, params)
  if (params.data.host?.disk?.["read.bytes"]) params.tools.cache.metricset(params.data.host.disk, params)
}
