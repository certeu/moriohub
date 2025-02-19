/*
 * Refer to the Morio documentation for details
 * on how to write a charts plugin
 */

export const moriodata = {
  throughput: {
    topics: 'Troughput per topic',
    processors: 'Troughput per stream processor',
    'topics.peak': 'Peak troughput per topic',
    'processors.peak': 'Peak troughput per stream processor',
  }
}

export default {
  throughput: ({ data, templates, clone }) => {
    const eps = 'Events per second'

    const topics = {
      ...clone(templates.charts.line),
      id: 'topics',
      series: Object.keys(data[0].data.topics).map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => Math.ceil(entry.data.topics[name]/30)),
      }))
    }
    topics.title.text = 'Throughput per topic'
    topics.yAxis.name = eps

    const procs = {
      ...clone(templates.charts.line),
      id: 'processors',
      series: Object.keys(data[0].data.procs).map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => Math.ceil(entry.data.procs[name]/30)),
      }))
    }
    procs.title.text = 'Throughput per stream processor'
    procs.yAxis.name = eps

    const topicsP = {
      ...clone(templates.charts.line),
      id: 'topics.peak',
      series: Object.keys(data[0].data.peak.topics).map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => Math.ceil(entry.data.peak.topics[name]/30)),
      }))
    }
    topicsP.title.text = 'Peak throughput per topic'
    topicsP.yAxis.name = eps

    const procsP = {
      ...clone(templates.charts.line),
      id: 'processors.peak',
      series: Object.keys(data[0].data.peak.procs).map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => Math.ceil(entry.data.peak.procs[name]/30)),
      }))
    }
    procsP.title.text = 'Peak throughput per stream processor'
    procsP.yAxis.name = eps

    return [topics, procs, topicsP, procsP]
  }
}

