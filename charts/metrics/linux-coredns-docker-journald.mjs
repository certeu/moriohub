export default {
  memory: (params) => {
    if (!params) return { memory: 'Memory Usage' }

    return params.lineChart([{
      id: 'memory',
      yName: 'Bytes',
      yFmt: (val) => params.formatBytes(val),
      series: ['res', 'virt'].map(name => ({
        name,
        path: name
      }))
    }], params.data)
  },

  network: (params) => {
    if (!params) return { network: 'Network Bandwidth' }
    const { data, templates, clone, formatBytes } = params
    const chart = {
      ...clone(templates.charts.line),
      id: 'network',
      series: ['egress', 'ingress'].map(name => {
        let prev
        return {
          ...templates.series.line,
          name,
          data: data.map((entry, i) => {
            let val
            if (i === 0) val = 0
            else val = (entry[name] - prev)/30
            prev = entry[name]

            return [entry.timestamp, val]
          })
        }
      })
    }
    /*
    * Rather than having the first value always be zero,
    * we set it equal to the second value because that makes
    * the graph easier to interpret.
    */
    for (const i in chart.series) {
      chart.series[i].data[0] = chart.series[i].data[1]
    }

    chart.title.text = 'Network Bandwidth'
    chart.yAxis.name = 'Bps'
    /*
    * This is in bytes, but we turn it into bps
    * Since we divided by 30 earlier it is now bytes per second
    * so we multiply by 8 and lowercase the B in teh label to get bps
    */
    chart.yAxis.axisLabel = { formatter: (val) => formatBytes(val*8, '/s').replace('B', 'b') }

    return [ chart ]
  },

  responses: (params) => {
    if (!params) return { __aa: 'Per-Zone DNS Responses' }
    const { data, templates, clone, formatBytes } = params
    // This is a bit more complicated as datasets are per zone/rcodes
    const zones = new Set()
    const rcodes = new Set()
    for (const d of data) {
      zones.add(d.zone)
      rcodes.add(d.rcode)
    }

    // Deal with many-zones/many-rcodes
    const charts = {}
    for (const zone of [...zones].sort()) {
      charts[zone] = {
        ...clone(templates.charts.line),
        id: zone,
        series: [...rcodes].sort().map(rcode => {
          let prev
          return {
            ...templates.series.line,
            name: rcode,
            data: data.filter(entry => (entry.zone === zone && entry.rcode === rcode)).map((entry, i) => {
              let val
              if (i === 0) val = 0
              else val = (entry.resps - prev)/30
              prev = entry.resps

              return [entry.timestamp, val]
            })
          }
        })
      }
      charts[zone].title.text = `DNS Responses per second for zone: ${zone}`
      charts[zone].yAxis.name = 'Resp/s'
      /*
      * Rather than having the first value always be zero,
      * we set it equal to the second value because that makes
      * the graph easier to interpret.
      */
      for (const i in charts[zone].series) {
        charts[zone].series[i].data[0] = charts[zone].series[i].data[1]
      }
    }

    return Object.values(charts)
  },

  requests: (params) => {
    if (!params) return { __aa: 'Per-Zone DNS Requests' }
    const { data, templates, clone, formatBytes } = params
    // This is a bit more complicated as datasets are per zone/proto/type
    const zones = new Set()
    const protos = new Set()
    const types = new Set()
    for (const d of data) {
      zones.add(d.zone)
      protos.add(d.proto)
      types.add(d.type)
    }
    if ([...protos].length > 1) {
      console.log('We do not (currently) support more than one type in the CoreDNS requests metrics')
      return []
    }

    // Deal with many-zones/many-types
    const charts = {}
    for (const zone of [...zones].sort()) {
      charts[zone] = {
        ...clone(templates.charts.line),
        id: zone,
        series: [...types].sort().map(type => {
          let prev
          return {
            ...templates.series.line,
            name: type,
            data: data.filter(entry => (entry.zone === zone && entry.type === type)).map((entry, i) => {
              let val
              if (i === 0) val = 0
              else val = (entry.reqs - prev)/30
              prev = entry.reqs

              return [entry.timestamp, val]
            })
          }
        })
      }
      charts[zone].title.text = `DNS Requests per second for zone: ${zone}`
      charts[zone].yAxis.name = 'Req/s'
      /*
      * Rather than having the first value always be zero,
      * we set it equal to the second value because that makes
      * the graph easier to interpret.
      */
      for (const i in charts[zone].series) {
        charts[zone].series[i].data[0] = charts[zone].series[i].data[1]
      }
    }

    return Object.values(charts)
  },
}
