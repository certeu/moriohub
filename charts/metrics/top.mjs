export default {
  "linux-load1": (params) => window.morio.charts.metrics.top._topLoad("1", params),
  "linux-load5": (params) => window.morio.charts.metrics.top._topLoad("5", params),
  "linux-load15": (params) => window.morio.charts.metrics.top._topLoad("15", params),
  "linux-mount-used": ({ data, templates, inventory, orderBy }) => {
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
  "linux-pressure-cpu-some10": (params) => window.morio.charts.metrics.top._topPressure("cpu", "10", "some", params),
  "linux-pressure-cpu-some60": (params) => window.morio.charts.metrics.top._topPressure("cpu", "60", "some", params),
  "linux-pressure-cpu-some300": (params) => window.morio.charts.metrics.top._topPressure("cpu", "300", "some", params),
  "linux-pressure-io-full10": (params) => window.morio.charts.metrics.top._topPressure("io", "10", "full", params),
  "linux-pressure-io-full60": (params) => window.morio.charts.metrics.top._topPressure("io", "60", "full", params),
  "linux-pressure-io-full300": (params) => window.morio.charts.metrics.top._topPressure("io", "300", "full", params),
  "linux-pressure-io-some10": (params) => window.morio.charts.metrics.top._topPressure("io", "10", "some", params),
  "linux-pressure-io-some60": (params) => window.morio.charts.metrics.top._topPressure("io", "60", "some", params),
  "linux-pressure-io-some300": (params) => window.morio.charts.metrics.top._topPressure("io", "300", "some", params),
  "linux-pressure-memory-full10": (params) => window.morio.charts.metrics.top._topPressure("memory", "10", "full", params),
  "linux-pressure-memory-full60": (params) => window.morio.charts.metrics.top._topPressure("memory", "60", "full", params),
  "linux-pressure-memory-full300": (params) => window.morio.charts.metrics.top._topPressure("memory", "300", "full", params),
  "linux-pressure-memory-some10": (params) => window.morio.charts.metrics.top._topPressure("memory", "10", "some", params),
  "linux-pressure-memory-some60": (params) => window.morio.charts.metrics.top._topPressure("memory", "60", "some", params),
  "linux-pressure-memory-some300": (params) => window.morio.charts.metrics.top._topPressure("memory", "300", "some", params),
  "_topLoad": (type, { data, templates, inventory, orderBy }) => {
      if (!data) return []
      const ordered = orderBy(data.map(d => ({ host: d.entry, value: d.value })), 'value', 'desc')

      // Now prepare the data for the Echarts
      const option = { ...templates.charts.horbar }
      option.id = `top_load${type}`
      option.title.text = `Top Load-${type} (normalized)`
      option.xAxis.name = `Load-${type}`
      option.yAxis.data = ordered.map(entry => ({ value: inventory[entry.host]?.fqdn || entry.host }))
      option.yAxis.name = 'Host'
      option.yAxis.axisLabel = { show: false }
      option.series = [{
        name: `load-${type}`,
        type: 'bar',
        label: {
          show: true,
          position: 'insideBottom',
          distance: 15,
          align: 'start',
          verticalAlign: 'end',
          formatter: "{b}: {c}",
        },
        data: ordered.map(entry => entry.value)
      }]

      return [option]
  },
  "_topPressure": (resource, period, scope, { data, templates, inventory, orderBy }) => {
    if (!data) return []
    const ordered = orderBy(data
      .map(d => ({ host: d.entry, value: Math.round(Number(d.value)*1000)/10 }))
      .filter(d => d.value > 0)
    , 'value', 'desc')

    if (ordered.length < 1) return []

    // Now prepare the data for the Echarts
    const option = { ...templates.charts.horbar }
    option.id = `toppres_${resource}_${period}_${scope}`
    option.title.text = `Top pressure on ${resource.toUpperCase()} over the last ${period}s`
    option.xAxis.name = `Pressure on ${resource}`
    option.yAxis.data = ordered.map(entry => ({ value: inventory[entry.host]?.fqdn || entry.host }))
    option.yAxis.name = 'Host'
    option.yAxis.axisLabel = { show: false }
    option.series = [{
      name: `${resource} pressure`,
      type: 'bar',
      label: {
        show: true,
        position: 'insideBottom',
        distance: 15,
        align: 'start',
        verticalAlign: 'bottom',
        formatter: "{b}: {c}%",
      },
      data: ordered.map(entry => entry.value)
    }]

    return option
  },
}
