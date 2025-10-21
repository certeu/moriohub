export default {
  id: 'moriohub_logs_linux-system',
  info: `This stream processor will process log data flowing through your Morio collector.

It can cache recent log data, as well as eventify them for event-driven automation.`,
  settings: {
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
  /*
   * This handler is for log data for module: linux-system
   *
   * @param {object} params - The full params passed to each handler
   */
  handler: (params) => params.settings.cache
    ? params.tools.cache.logline(params.data.message, params)
    : null,
}
