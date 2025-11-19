/*
 * Refer to the Morio documentation for details
 * on how to write a charts plugin
 */
export default {
  "top-linux-mount-used": ({ data, templates, inventory, orderBy }) => {
    const ordered = orderBy(
      data.map(d => {
        const [host, mount] = d.entry.split('|')
        return { host, mount, value: d.value }
      }),
      'value',
      'desc',
    )
    // Now prepare the data for the Echarts
    const option = { ...templates.charts.horbar }
    option.title.text = `Top used mounts`
    option.xAxis.name = "Used %"
    option.yAxis.data = ordered.map(entry => ({ value: `${entry.mount} on ${inventory[entry.host]?.fqdn || entry.host }` }))
    option.yAxis.name = "Host"
    option.yAxis.axisLabel = { show: false }
    option.series = [{
      name: `used`,
      type: 'bar',
      label: {
        show: true,
        position: 'insideBottom',
        distance: 15,
        align: 'start',
        verticalAlign: 'end',
        formatter: "{b}: {c}%",
      },
      data: ordered.map(entry => Math.round(entry.value * 1000)/10)
    }]

    return option
  },
  "top-linux-load1": (params) => morio.charts.lib.metricsTopLoad("1", params),
  "top-linux-load5": (params) => morio.charts.lib.metricsTopLoad("5", params),
  "top-linux-load15": (params) => morio.charts.lib.metricsTopLoad("15", params),
  "top-linux-pressure-cpu-some10": (params) => window.morio.charts._lib.metricsTopPressure("cpu", "10", "some", params),
  "top-linux-pressure-cpu-some60": (params) => window.morio.charts._lib.metricsTopPressure("cpu", "60", "some", params),
  "top-linux-pressure-cpu-some300": (params) => window.morio.charts._lib.metricsTopPressure("cpu", "300", "some", params),
  "top-linux-pressure-io-full10": (params) => window.morio.charts._lib.metricsTopPressure("io", "10", "full", params),
  "top-linux-pressure-io-full60": (params) => window.morio.charts._lib.metricsTopPressure("io", "60", "full", params),
  "top-linux-pressure-io-full300": (params) => window.morio.charts._lib.metricsTopPressure("io", "300", "full", params),
  "top-linux-pressure-io-some10": (params) => window.morio.charts._lib.metricsTopPressure("io", "10", "some", params),
  "top-linux-pressure-io-some60": (params) => window.morio.charts._lib.metricsTopPressure("io", "60", "some", params),
  "top-linux-pressure-io-some300": (params) => window.morio.charts._lib.metricsTopPressure("io", "300", "some", params),
  "top-linux-pressure-memory-full10": (params) => window.morio.charts._lib.metricsTopPressure("memory", "10", "full", params),
  "top-linux-pressure-memory-full60": (params) => window.morio.charts._lib.metricsTopPressure("memory", "60", "full", params),
  "top-linux-pressure-memory-full300": (params) => window.morio.charts._lib.metricsTopPressure("memory", "300", "full", params),
  "top-linux-pressure-memory-some10": (params) => window.morio.charts._lib.metricsTopPressure("memory", "10", "some", params),
  "top-linux-pressure-memory-some60": (params) => window.morio.charts._lib.metricsTopPressure("memory", "60", "some", params),
  "top-linux-pressure-memory-some300": (params) => window.morio.charts._lib.metricsTopPressure("memory", "300", "some", params),
}

