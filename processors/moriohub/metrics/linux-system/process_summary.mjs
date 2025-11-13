/*
 * Caches the process_summary metricset. Does not (currently) eventify.
 */
export default function process_summary (params) {
  if (params.settings.cache) return params.tools.cache.metricset(
    params.data.system.process.summary,
    params
  )

  return false
}
