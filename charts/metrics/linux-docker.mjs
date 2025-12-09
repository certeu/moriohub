export default {
  containers: (params) => {
    if (!params) return { containers: 'Docker Containers' }
    const series = ['paused', 'running', 'stopped', 'total']
    return params.lineChart([{
      id: 'containers',
      yName: 'Count',
      title: 'Docker Containers',
      series: series.map(name => ({
        name,
        path: name
      }))
    }], params.data)
  },

  healthcheck: (params) => {
    if (!params) return {}
    const { data, templates, clone, chartGradient } = params
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

  images: (params) => params
    ? params.lineChart([{
        title: 'Docker Images',
        id: 'Images',
        yName: 'Images',
        series: [{
          name: 'Images',
          path: 'count'
        }]
      }], params.data)
    : { images: 'Docker Images' },
}
