export default {
  memory: ({ data, formatBytes, lineChart }) => lineChart([{
    id: 'memory',
    title: 'Memory Usage',
    yName: 'Bytes',
    yFmt: (val) => formatBytes(val),
    series: ['res', 'virt'].map(name => ({
      name,
      path: name
    }))
  }], data),

  network: ({ data, formatBytes, lineChart }) => lineChart([{
    id: 'network',
    title: 'Network Bandwidth',
    yFmt: (val) => formatBytes(val*8, '/s').replace('B', 'b'),
    series: ['egress', 'ingress'].map(name => ({ name, path: name }))
  }], data),

  responses: ({ data, templates, clone, formatBytes }) => {
    // This is a bit more complicated as datasets are per zone/rcodes
    let zones = new Set()
    let rcodes = new Set()
    for (const d of data) {
      zones.add(d.zone)
      rcodes.add(d.rcode)
    }
    zones = [...zones]
    zones.sort()
    rcodes = [...rcodes]
    rcodes.sort()

    // Deal with many-zones/many-rcodes
    const charts = {}
    for (const zone of zones) {
      charts[zone] = {
        ...clone(templates.charts.line),
        id: zone,
        series: rcodes.map(rcode => {
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

  requests: ({ data, templates, clone, formatBytes }) => {
    // This is a bit more complicated as datasets are per zone/proto/type
    let zones = new Set()
    let protos = new Set()
    let types = new Set()
    for (const d of data) {
      zones.add(d.zone)
      protos.add(d.proto)
      types.add(d.type)
    }
    zones = [...zones]
    zones.sort()
    protos = [...protos]
    protos.sort()
    types = [...types]
    types.sort()
    if (protos.length > 1) {
      console.log('We do not (currently) support more than one type in the CoreDNS requests metrics')
      return []
    }

    // Deal with many-zones/many-types
    const charts = {}
    for (const zone of zones) {
      charts[zone] = {
        ...clone(templates.charts.line),
        id: zone,
        series: types.map(type => {
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
