const pressureWindows = ["10", "60", "300"]

/*
 * Caches pressure metricset. Does not (currently) eventify.
 */
export default function pressure (params) {
  if (!params.settings.cache) return

  const { data, settings, tools } = params
  // Default caching
  let type = false
  if (data.linux?.pressure?.cpu) type = 'cpu'
  else if (data.linux?.pressure?.memory) type = 'memory'
  else if (data.linux?.pressure?.io) type = 'io'
  if (!type) return

  // Default caching
  tools.cache.metricset(data.linux.pressure[type], params, `pressure.${type}`)
  // Top-x caching
  pressureWindows.map(t => tools.cache.top(
    `metric|-|top|linux-pressure-${type}-some${t}`,
    [ data.host.id, Number(data.linux.pressure[type].some[t].pct) ]
  ))
  // IO and Memory also have full data
  if (type !== "cpu") pressureWindows.map(t => tools.cache.top(
    `metric|-|top|linux_pressure-${type}-full${t}`,
    [ data.host.id, Number(data.linux.pressure[type].full[t].pct) ]
  ))
}
