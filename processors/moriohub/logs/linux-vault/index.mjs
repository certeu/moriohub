/*
 * Morio stream processors to handle logs data from the linux-vault module
 * We have one handler to cache all logs from this module
 */
export default [
  {
    id: `moriohub_logs_linux-vault`,
    info: `This stream processor plugin will cache log data from the linux-vault module.`,
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
      modules: ['linux-vault'],
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

      if (params.data.hashicorp?.vault?.log) return params.tools.cache.logline(params.data.hashicorp.vault.log, params)
      if (params.data.hashicorp?.vault?.audit_log) return params.tools.cache.logline(params.data.hashicorp.vault.audit_log, params)
    }
  }
]
