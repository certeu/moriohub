export default {
  diskio: (params) => {
    if (!params) return {
      bytes: 'IO Bytes per second',
      count: 'IO Operations per second',
    }

    const { data, templates, clone, formatNumber, formatBytes, lineChart } = params
    /*
      * We have multiple documents per tick
      * One for each disk. So we first need to compile
      * a list of all disks for which we have metrics
      */
    const disks = new Set()
    for (const d of data) disks.add(d.name)

    /*
      * These metrics are an increasing counter
      * So we need to calculate the delta from the previous value.
      * This also means we cannot determine the very first value
      * reliably.
      */
    const charts = { }
    for (const chart of ['bytes', 'count']) {
      charts[chart] = {
        ...clone(templates.charts.line),
        /*
          * Sort the disk list to maintain the same order
          * as the chart colors will be determined by this
          * and not doing so risks colors being swapped by
          * live updates
          */
        series: [...disks].map(name => `${name}_read`)
          .concat([...disks].map(name => `${name}_write`))
          .sort().map(name => {
            let prev
            const [disk, type] = name.split('_')
            return {
              ...templates.series.line,
              name,
              data: data.filter(entry => entry.name === disk).map((entry, i) => {
                let val
                if (i === 0) val = 0
                else val = Math.ceil((entry[type][chart] - prev)/30)
                prev = entry[type][chart]
                return [entry.timestamp, val]
              })
            }
          }),
        id: chart,
      }
      /*
        * Rather than having the first value always be zero,
        * we set it equal to the second value because that makes
        * the graph easier to interpret.
        */
      for (const i in charts[chart].series) {
        charts[chart].series[i].data[0] = charts[chart].series[i].data[1]
      }
    }

    // Set titles and yAxis label
    charts.bytes.title.text = 'IO Bytes per second (per disk)'
    charts.bytes.yAxis.name = 'IO bytes per second'
    charts.count.title.text = 'IO Operations per second (per disk)'
    charts.count.yAxis.name = 'IO operations per second'

    // Format bytes
    charts.bytes.yAxis.axisLabel = { formatter: formatBytes }

    // Give more room for yAxis text
    charts.bytes.yAxis.nameGap = 70

    charts.totalBytes = {
      ...clone(templates.charts.line),
      id: 'bytes-total',
      series: ['read', 'write'].map(name => ({
        ...templates.series.line,
        name,
        data: data
          .filter(entry => entry["read.bytes"] ? true : false)
          .map(entry => [entry.timestamp, entry[`${name}.bytes`]/30])
      }))
    }
    // Set titles and yAxis label
    charts.totalBytes.title.text = 'IO Total Bytes'
    charts.totalBytes.yAxis.name = 'IO bytes per second'
    // Format bytes
    charts.totalBytes.yAxis.axisLabel = { formatter: formatBytes }
    // Give more room for yAxis text
    charts.totalBytes.yAxis.nameGap = 70

    return Object.values(charts)
  },
  filesystem: (params) => {
    if (!params) return { filesystem: 'Used disk space per mount' }

    const { data, templates, clone, formatBytes } = params
    /*
      * We have multiple documents per tick
      * One for each mount point. So we first need to compile
      * a list of all mount points for which we have metrics
      */
    // {\"files\":124440,\"mount_point\":\"/boot\",\"used\":0.6017,\"timestamp\":1763045138521}
    const mounts = new Set()
    for (const m of data.filter(d => d.files)) mounts.add(m.mount_point)

    /*
      * The used field holds a percentage (0 => 1)
      */
    const used = {
      ...clone(templates.charts.line),
      /*
        * Sort the mounts list to maintain the same order
        * as the chart colors will be determined by this
        * and not doing so risks colors being swapped by
        * live updates
        */
      series: [...mounts].sort()
        .map(name => {
          let prev
          return {
            ...templates.series.line,
            name,
            data: data.filter(entry => entry.mount_point === name).map((entry, i) => [entry.timestamp, entry.used])
          }
        }),
      id: 'filesystem',
    }

    // Set titles and yAxis label
    used.title.text = 'Used disk space per Mount'
    used.yAxis.name = 'Percentage'

    // Format bytes
    used.yAxis.axisLabel = { formatter: (val) => Math.round(val*1000)/10+'%' }

    // Give more room for yAxis text
    used.yAxis.nameGap = 70

    return [used]
  },
  load: (params) => {
    if (!params) return {
      full: 'Total load',
      norm: 'Normalized load'
    }
    const { clone, templates, data } = params

    const full = {
      ...clone(templates.charts.line),
      id: 'full',
      series: ['1', '5', '15'].map(name => ({
        ...templates.series.line,
        name: `load-${name}`,
        data: data.map(entry => [entry.timestamp, entry[name]])
      }))
    }
    full.title.text = `Total load (${data[0].cores} cores)`
    full.yAxis.name = 'Load'

    const norm = {
      ...clone(templates.charts.line),
      id: 'norm',
      series: ['1', '5', '15'].map(name => ({
        ...templates.series.line,
        name: `load-${name}`,
        data: data.map(entry => [entry.timestamp, entry.norm[name]])
      }))
    }
    norm.title.text = `Normalized load`
    norm.yAxis.name = 'Load'

    return [ full, norm ]
  },
  memory: (params) => {
    if (!params) return { usage: 'Memory Usage' }

    const { data, templates, clone } = params

    const mem = {
      ...clone(templates.charts.line),
      id: 'usage',
      series: ['actual', 'used', 'swap'].map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => [entry.timestamp, entry[name]])
      }))
    }
    mem.title.text = 'Memory Usage'
    mem.yAxis.name = '%'
    mem.yAxis.axisLabel = { formatter: (val) => `${val*100}%` }

    return [ mem ]
  },
  network_summary: (params) => {
    if (!params) return {
      icmp: 'ICMP',
      tcp: 'TCP',
      conns: 'Established TCP Connections'
    }

    const { data, templates, clone } = params
    const labels = {
      icmp: {
        indu: 'Dest. Unreach. (in)',
        outdu: 'Dest. Unreach. (out)',
        rlhost: 'Rate-Limit Host',
      },
      tcp: {
        in: 'Segments In',
        out: 'Segments Out',
        rt: 'Segments Retrans.',
        to: 'Timeouts',
      }
    }
    const charts = {}
    for (const chart in labels) {
      charts[chart] = {
        ...clone(templates.charts.line),
        id: chart,
        series: Object.keys(labels[chart]).map(name => {
          let prev
          return {
            ...templates.series.line,
            name: labels[chart][name],
            data: data.map((entry, i) => {
              let val
              if (i === 0) val = 0
              else val = (entry[chart][name] - prev)/30
              prev = entry[chart][name]

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
      for (const i in charts[chart].series) {
        charts[chart].series[i].data[0] = charts[chart].series[i].data[1]
      }
    }

    // Set titles and yAxis label
    charts.icmp.title.text = 'ICMP'
    charts.icmp.yAxis.name = "Events per second"
    charts.tcp.title.text = 'TCP'
    charts.tcp.yAxis.name = "Events per second"

    charts.conns = {
      ...clone(templates.charts.line),
      id: 'conns',
      series: [{
        ...templates.series.line,
        name: 'Established Connections',
        data: data.map(entry => [entry.timestamp, entry.tcp.ce])
      }]
    }
    charts.conns.title.text = 'Established TCP Connections'
    charts.conns.yAxis.name = "Connection count"

    return Object.values(charts)
  },
  process_summary: (params) => {
    if (!params) return {
      procs: 'Processes',
      threads: 'Threads',
    }

    const { data, templates, clone } = params
    const procs = {
      ...clone(templates.charts.line),
      id: 'procs',
      series: Object.keys(data[0])
        .filter(key => !['timestamp', 'threads'].includes(key))
        .map(name => ({
          ...templates.series.line,
          name,
          data: data.map(entry => [entry.timestamp, entry[name]])
        }))
    }
    // Set titles and yAxis label
    procs.title.text = 'Processes'
    procs.yAxis.name = "Process count"

    const threads = {
      ...clone(templates.charts.line),
      id: 'threads',
      series: Object.keys(data[0].threads).map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => [entry.timestamp, entry.threads[name]])
      }))
    }
    // Set titles and yAxis label
    threads.title.text = 'Threads'
    threads.yAxis.name = "Thread count"

    return [procs, threads]
  },
  "ressure.cpu": (params) => {
    if (!params) return {
      "cpu-pressure": "CPU Pressure",
      "cpu-stall-us": "Total CPU Stall time in μs",
    }

    const { data, templates, clone } = params
    const pressure = {
      ...clone(templates.charts.line),
      id: 'cpu-pressure',
      series: ['10', '60', '300'].map(name => ({
        ...templates.series.line,
        name: `${name}s-pressure`,
        data: data.map(entry => [entry.timestamp, entry.some[name].pct])
      }))
    }
    pressure.title.text = `CPU Pressure`
    pressure.yAxis.name = 'Pressure'

    const time = {
      ...clone(templates.charts.line),
      id: 'cpu-stall-us',
      series: [{
        ...templates.series.line,
        name: `stall-time-us`,
        data: data.map(entry => [entry.timestamp, entry.some.total.time.us])
      }]
    }
    time.title.text = `Total CPU Stall Time in μs`
    time.yAxis.name = 'Microseconds'
    time.yAxis.min = 'dataMin'

    return [ pressure, time ]
  },
  "pressure.io": (params) => {
    if (!params) return {
      "io-pressure-full": "IO Pressure (full)",
      "io-pressure-some": "IO Pressure (some)",
      "io-stall-us-full": "Total IO Stall Time in μs (full)",
      "io-stall-us-some": "Total IO Stall Time in μs (some)",
    }

    const { data, templates, clone } = params
    const charts = []
    for (const type of ["full", "some"]) {
      const chart = {
        ...clone(templates.charts.line),
        id: `io-pressure-${type}`,
        series: ['10', '60', '300'].map(name => ({
          ...templates.series.line,
          name: `${name}s-pressure-${type}`,
          data: data.map(entry => [entry.timestamp, entry[type][name].pct])
        }))
      }
      chart.title.text = `IO Pressure (${type})`
      chart.yAxis.name = 'Pressure'
      charts.push(chart)
      const time = {
        ...clone(templates.charts.line),
        id: `io-stall-us-${type}`,
        series: [{
          ...templates.series.line,
          name: `stall-time-us-${type}`,
          data: data.map(entry => [entry.timestamp, entry[type].total.time.us])
        }]
      }
      time.title.text = `Total IO Stall Time in μs (${type})`
      time.yAxis.name = 'Microseconds'
      time.yAxis.min = 'dataMin'
      charts.push(time)
    }

    return charts
  },
  "pressure.memory": (params) => {
    if (!params) return {
      "memory-pressure-full": "Memory Pressure (full)",
      "memory-pressure-some": "Memory Pressure (some)",
      "memory-stall-us-full": "Total Memory Stall Time in μs (full)",
      "memory-stall-us-some": "Total Memory Stall Time in μs (some)",
    }
    const { data, templates, clone } = params
    const charts = []
    for (const type of ["full", "some"]) {
      const chart = {
        ...clone(templates.charts.line),
        id: `memory-pressure-${type}`,
        series: ['10', '60', '300'].map(name => ({
          ...templates.series.line,
          name: `${name}s-pressure-${type}`,
          data: data.map(entry => [entry.timestamp, entry[type][name].pct])
        }))
      }
      chart.title.text = `Memory Pressure (${type})`
      chart.yAxis.name = 'Pressure'
      charts.push(chart)
      const time = {
        ...clone(templates.charts.line),
        id: `memory-stall-us-${type}`,
        series: [{
          ...templates.series.line,
          name: `stall-time-us-${type}`,
          data: data.map(entry => [entry.timestamp, entry[type].total.time.us])
        }]
      }
      time.title.text = `Total Memory Stall Time in μs (${type})`
      time.yAxis.name = 'Microseconds'
      time.yAxis.min = 'dataMin'
      charts.push(time)
    }

    return charts
  },
  socket_summary: (params) => {
    if (!params) return {
      sockets: "All Sockets",
      tcp: "TCP Sockets",
    }

    const { data, templates, clone } = params
    const all = {
      ...clone(templates.charts.line),
      id: 'sockets',
      series: [
        {
          ...templates.series.line,
          name: 'all',
          data: data.map(entry => [entry.timestamp, entry.all.count])
        },
        {
          ...templates.series.line,
          name: 'listening',
          data: data.map(entry => [entry.timestamp, entry.all.listening])
        },
        {
          ...templates.series.line,
          name: 'tcp',
          data: data.map(entry => [entry.timestamp, entry.tcp.count])
        },
        {
          ...templates.series.line,
          name: 'udp',
          data: data.map(entry => [entry.timestamp, entry.udp.count])
        },
      ]
    }
    // Set titles and yAxis label
    all.title.text = 'All Sockets'
    all.yAxis.name = "Socket count"

    const tcp = {
      ...clone(templates.charts.line),
      id: 'tcp',
      series: Object.keys(data[0].tcp).filter(key => key !== 'count').map(name => ({
        ...templates.series.line,
        name,
        data: data.map(entry => [entry.timestamp, entry.tcp[name]])
      }))
    }
    // Set titles and yAxis label
    tcp.title.text = 'TCP Sockets'
    tcp.yAxis.name = "Socket count"

    return [all, tcp]
  },
}
