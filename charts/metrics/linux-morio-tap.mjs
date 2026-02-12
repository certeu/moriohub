export default {
  json: ({ data, templates, clone, lineChart, chartGradient }) => {
    // We'll use these
    const threads = Object.keys(data[0].instances)
    const topics = Object.keys(data[0].instances?.[0]?.counters?.lag?.topics || {}).sort()
    const processors = Object.keys(data[0].instances?.[0]?.counters?.processors || {}).sort()

    // This will hold our charts
    const charts = {}


    // Total lag (lagt)
    charts.lagt = {
      ...clone(templates.charts.line),
      series: {
        ...templates.series.line,
        name: `Lag`,
        areaStyle: {
          opacity: 0.2,
          color: chartGradient('#1b88a2'),
        },
        // When the service restarts, we may end up with a data entry
        // that lacks counters. So let's guard against that
        data: data.map((entry, i) => {
          let val = 0
          // Set value to -1 if it's missing for some reason
          for (const id of threads) {
            val += entry.instances?.[id]?.counters?.lag?.total || -1
          }
          return [entry.timestamp, val]
        })
      },
      id: 'lagt',
    }
    // Set titles and yAxis label
    charts.lagt.title.text = 'Total lag'
    charts.lagt.yAxis.name = 'Lag'


    // Lag per thread/instance (lagpi)
    charts.lagpi = lineChart([
      {
        id: 'lagpi',
        title: `Total lag per thread`,
        yValue: 'Lag',
        series: threads.map(id => ({
          name: `thread-${id}`,
          path: `instances.${id}.counters.lag.total`
        }))
      },
    ], data).pop()


    // Lag per topic (lagpt)
    charts.lagpt = {
      ...clone(templates.charts.line),
      series: topics.map(topic => ({
        ...templates.series.line,
        name: topic,
        data: data.map((entry, i) => {
          let val = 0
          for (const id of threads) {
            // Add topic count, or add zero if it's missing
            val += entry.instances?.[id]?.counters?.lag?.topics?.[topic] || 0
          }
          return [entry.timestamp, val]
        })
      })),
      id: 'lagpt',
    }
    // Set titles and yAxis label
    charts.lagpt.title.text = 'Total lag per topic'
    charts.lagpt.yAxis.name = 'Lag'


    // Total throughput (ttp)
    charts.ttp = {
      ...clone(templates.charts.line),
      /*
       * These metrics are an increasing counter
       * So we need to calculate the delta from the previous value.
       * This also means we cannot determine the very first value
       * reliably.
       */
      series: [0].map(i => {
        let prev
        return {
          ...templates.series.line,
          name: `Throughput`,
          areaStyle: {
            opacity: 0.2,
            color: chartGradient('#1b88a2'),
          },
          data: data.map((entry, i) => {
            let val
            if (i === 0) val = 0
            else {
              curval = 0
              for (const id of threads) {
                // Add total count, or add zero if it's missing
                curval += entry.instances?.[id]?.counters?.total?.messages || 0
              }
              val = Math.ceil((curval - prev)/30)
              /*
               * When the counter resets (after a restart for example)
               * the throughput will be an enourmous negative value
               * so we just set it to zero as that will make the graph
               * show what actually happens (brief zero troughput rather
               * than a sudden negative throughput)
               */
              if (val < 1) val = 0
              prev = curval
            }
            return [entry.timestamp, val]
          })
        }
      }),
      id: 'ttp',
    }
    // Set titles and yAxis label
    charts.ttp.title.text = 'Total throughput'
    charts.ttp.yAxis.name = 'Mesages  / second'
    /*
     * Rather than having the first value always be zero,
     * we set it equal to the second value because that makes
     * the graph easier to interpret.
     */
    charts.ttp.series[0].data[0] = charts.ttp.series[0].data[1]


    // Throughput per instance/thread (tppi)
    charts.tppi = {
      ...clone(templates.charts.line),
      series: threads.map(id => {
        let prev
        return {
          ...templates.series.line,
          name: `thread-${id}`,
          data: data.map((entry, i) => {
            let val
            if (i === 0) val = 0
            else val = Math.ceil(((entry.instances?.[id]?.counters?.total?.messages || 0) - prev)/30)
            /*
             * When the counter resets (after a restart for example)
             * the throughput will be an enourmous negative value
             * so we just set it to zero as that will make the graph
             * show what actually happens (brief zero troughput rather
             * than a sudden negative throughput)
             */
            if (val < 1) val = 0
            prev = entry.instances?.[id]?.counters?.total?.messages || 0
            return [entry.timestamp, val]
          })
        }
      }),
      id: 'tppi',
    }
    /*
     * Rather than having the first value always be zero,
     * we set it equal to the second value because that makes
     * the graph easier to interpret.
     */
    for (const id of threads) charts.tppi.series[id].data[0] = charts.tppi.series[id].data[1]
    // Set titles and yAxis label
    charts.tppi.title.text = 'Throughput per thread'
    charts.tppi.yAxis.name = 'Mesages  / second'


    // Throughput per topic (tppt)
    charts.tppt = {
      ...clone(templates.charts.line),
      /*
       * These metrics are an increasing counter
       * So we need to calculate the delta from the previous value.
       * This also means we cannot determine the very first value
       * reliably.
       */
      series: topics.map(topic => {
        let prev
        return {
          ...templates.series.line,
          name: topic,
          data: data.map((entry, i) => {
            let val
            if (i === 0) val = 0
            else {
              curval = 0
              for (const id of threads) {
                // Add topic count, or add zero if it's missing
                curval += entry.instances?.[id]?.counters?.topics?.[topic] || 0
              }
              val = Math.ceil((curval - prev)/30)
              /*
               * When the counter resets (after a restart for example)
               * the throughput will be an enourmous negative value
               * so we just set it to zero as that will make the graph
               * show what actually happens (brief zero troughput rather
               * than a sudden negative throughput)
               */
              if (val < 1) val = 0
              prev = curval
            }
            return [entry.timestamp, val]
          })
        }
      }),
      id: 'tppt',
    }
    /*
     * Rather than having the first value always be zero,
     * we set it equal to the second value because that makes
     * the graph easier to interpret.
     */
    for (const id in topics) charts.tppt.series[id].data[0] = charts.tppt.series[id].data[1]
    // Set titles and yAxis label
    charts.tppt.title.text = 'Throughput per topic'
    charts.tppt.yAxis.name = 'Mesages  / second'


    // Throughput per stream processor (tppp)
    charts.tppp = {
      ...clone(templates.charts.line),
      series: processors.map(proc => {
        let prev
        return {
          ...templates.series.line,
          name: proc,
          data: data.map((entry, i) => {
            let val
            if (i === 0) val = 0
            else {
              curval = 0
              for (const id of threads) {
                // Add processor count, or add zero if it's missing
                curval += entry.instances?.[id]?.counters?.processors?.[proc]
              }
              val = Math.ceil((curval - prev)/30)
              /*
               * When the counter resets (after a restart for example)
               * the throughput will be an enourmous negative value
               * so we just set it to zero as that will make the graph
               * show what actually happens (brief zero troughput rather
               * than a sudden negative throughput)
               */
              if (val < 1) val = 0
              prev = curval
            }
            return [entry.timestamp, val]
          })
        }
      }),
      id: 'tppp',
    }
    /*
     * Rather than having the first value always be zero,
     * we set it equal to the second value because that makes
     * the graph easier to interpret.
     */
    for (const id in processors) charts.tppp.series[id].data[0] = charts.tppp.series[id].data[1]
    // Set titles and yAxis label
    charts.tppp.title.text = 'Throughput per stream processor'
    charts.tppp.yAxis.name = 'Mesages  / second'


    // PM2 Active Handles (pm2ah)
    charts.pm2ah = lineChart([{
      id: 'pm2ah',
      title: `Active handles`,
      yValue: 'Handles',
      series: threads.map(id => ({
        name: `thread-${id}`,
        path: `instances.${id}.pm2.activeHandles`
      }))
    }], data).pop()


    // PM2 CPU (pm2cpu)
    charts.pm2cpu = lineChart([{
      id: 'pm2cpu',
      title: `CPU`,
      yValue: 'CPU %',
      series: threads.map(id => ({
        name: `thread-${id}`,
        path: `instances.${id}.pm2.cpu`
      }))
    }], data).pop()


    // PM2 Event Loop Latency (pm2ell)
    charts.pm2ell = lineChart([{
      id: 'pm2ell',
      title: `Event Loop Latency`,
      yValue: '%',
      series: threads.map(id => ({
        name: `thread-${id}`,
        path: `instances.${id}.pm2.eventLoopLatency`
      }))
    }], data).pop()


    // PM2 Event Loop Latency P95 (pm2ellp95)
    charts.pm2ellp95 = lineChart([{
      id: 'pm2ellp95',
      title: `Event Loop Latency P95`,
      yValue: '%',
      series: threads.map(id => ({
        name: `thread-${id}`,
        path: `instances.${id}.pm2.eventLoopLatencyP95`
      }))
    }], data).pop()


    // PM2 Restarts (pm2res)
    charts.pm2res = lineChart([{
      id: 'pm2res',
      title: `Restarts`,
      yValue: 'Restarts',
      series: threads.map(id => ({
        name: `thread-${id}`,
        path: `instances.${id}.pm2.restarts`
      }))
    }], data).pop()


    return Object.values(charts)
  }
}

