/*
 * Morio stream processors to handle logs data from the linux-elasticsearch module
 * We have one handler to cache all logs from this module
 */
export default [
  {
    id: `moriohub_logs_linux-elasticsearch`,
    info: `This stream processor plugin will cache log data from the linux-elasticsearch module.`,
    settings: {
      enabled: {
        dflt: true,
        title: `Enable this stream processor`,
        type: 'list',
        list: [
          {
            val: false,
            label: `Do not enable this stream processor (disable)`,
          },
          {
            val: true,
            label: `Enable this stream processor (disable)`,
          },
        ],
      },
      topics: ['logs'],
      modules: ['linux-elasticsearch'],
      cache: {
        dflt: true,
        title: 'Cache log data',
        type: 'list',
        list: [
          {
            val: false,
            label: 'Do not cache log data (disable)',
          },
          {
            val: true,
            label: 'Cache recent log data',
            about: 'Caching log data allows consulting it through the dashboards provided by Morio&apos;s UI service'
          },
        ],
      },
      cap: {
        dflt: 25,
        title: 'Maximum number of log lines per logset',
        about: 'This limites the log lines stored per logset.',
        labelBL: 'In log lines',
        type: 'number'
      },
    },
    handler: (params) => {
      if (!params.settings.cache) return null
      for (const type of ['audit', 'deprecation', 'esql', 'server']) {
        if (params.data.elasticsearch?.[type]?.log) {
          return params.tools.cache.logline(params.data.elasticsearch[type].log, params)
        }
      }
      for (const type of ['index', 'search']) {
        if (params.data.elasticsearch?.slow?.[type]?.log) {
          return params.tools.cache.logline(params.data.elasticsearch.slow[type].log, params)
        }
      }

      return params.tools.cache.logline(params.data.message, params)
    }
  }
]
