/*
 * Caches json metricsets. Does not (currently) eventify.
 */
export default function collector (params) {
  if (params.settings.cache) {
    const { data, tools } = params

    // Handle tap metrics
    if (data.http?.morio?.tap) return tools.cache.metricset(data.http.morio.tap, params)

    // Log unhandled metricset
    tools.note("Morio Tap unhandled metricset", data)
  }
}
