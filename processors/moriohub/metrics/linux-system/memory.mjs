/*
 * Caches memory metricset. Does not (currently) eventify.
 */
export default function memory (params) {
  if (params.settings.cache) return params.tools.cache.metricset(
    {
      actual: params.data.system.memory.actual.used.pct,
      swap: params.data.system.memory.swap.used.pct,
      used: params.data.system.memory.used.pct,
    }, 
    params
  )
}
