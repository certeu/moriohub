import journaldProcessSystemd from './journald-process-systemd.mjs'
// Shared code
import { config } from './_lib.mjs'

/*
 * Morio stream processors to handle logs data from the linux-system module
 * We have one handler per dataset, and one to handle all logs
 */
export default [
  ...Object.entries({
    "journald.process.systemd": journaldProcessSystemd,
  }).map(([set, handler]) => typeof handler === 'function' ? config(set, handler) : undefined),
  {
    id: `moriohub_logs_linux-system`,
    info: `This stream processor plugin will cache log data from the linux-system module.`,
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
      modules: ['linux-system'],
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
    handler: (params) => params.settings.cache
      ? params.tools.cache.logline(params.data.message, params)
      : null,
  }
]
