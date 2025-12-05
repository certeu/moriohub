export default {
  containers: ({ data, templates, clone }) => {
    const series = ['paused', 'running', 'stopped', 'total']
    const chart = {
      ...clone(templates.charts.line),
      id: 'containers',
      series: series.map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => [entry.timestamp, entry[name]])
      }))
    }
    chart.title.text = 'Containers'
    chart.yAxis.name = 'Count'

    return [ chart ]
  },
  healthcheck: ({ data, templates, clone, chartGradient }) => {
    // Healthchecks are per container
    const containers = new Set()
    for (const d of data) containers.add(d.name)
    const charts = {}
    for (const name of [...containers].sort()) {
      charts[name] = {
        ...clone(templates.charts.line),
        id: name,
        series: [{
          ...templates.series.line,
          areaStyle: {
            opacity: 0.2,
            color: chartGradient('#1b88a2'),
          },
          name,
          data: data.filter(entry => (entry.name === name)).map(entry => [entry.timestamp, entry.took])
        }]
      }
      const latest = data.filter(entry => (entry.name === name)).pop()
      charts[name].title.text = `Container ${name} is ${latest.status}`
      charts[name].title.subtext = `(${latest.image})`
      charts[name].yAxis.name = 'Reponse time in ms'
    }

    return Object.values(charts)
  },
  images: ({ data, templates, clone }) => {
    const chart = {
      ...clone(templates.charts.line),
      id: 'containers',
      series: [{
        ...templates.series.line,
        name: 'Images',
        data: data.map(entry => [entry.timestamp, entry.count])
      }]
    }
    chart.title.text = 'Container Images'
    chart.yAxis.name = 'Count'

    return [ chart ]
  }
}
