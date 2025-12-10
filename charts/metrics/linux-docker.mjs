export default {
  containers: ({ data, lineChart }) => lineChart([{
    id: 'containers',
    yName: 'Count',
    title: 'Docker Containers',
    series: ['paused', 'running', 'stopped', 'total'].map(name => ({
      name,
      path: name
    }))
  }], data),

  healthcheck: ({ data, lineChart, templates, clone, chartGradient }) => {
    // Healthchecks are per container
    const containers = new Set()
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

  images: ({ data, lineChart }) => lineChart([
    {
      title: 'Docker Images',
      id: 'Images',
      yName: 'Images',
      series: [{
        name: 'Images',
        path: 'count'
      }]
    }
  ], data),
}
