export default {
  _lib: {
    metricsTopLoad: (type, { data, templates, inventory, orderBy }) => {
      if (!data) return null
      const ordered = orderBy(data.map(d => ({ host: d.entry, value: d.value })), 'value', 'desc')

      // Now prepare the data for the Echarts
      const option = { ...templates.charts.horbar }
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

      return option
  },
  metricsTopPressure: (resource, period, scope, { data, templates, inventory, orderBy }) => {
    if (!data) return null
    const ordered = orderBy(data
      .map(d => ({ host: d.entry, value: Math.round(Number(d.value)*1000)/10 }))
      .filter(d => d.value > 0)
    , 'value', 'desc')

    if (ordered.length < 1) return null

    // Now prepare the data for the Echarts
    const option = { ...templates.charts.horbar }
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
  }
}
