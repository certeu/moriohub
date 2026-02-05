import { logsProcessor } from '../../lib.mjs'

const dflts = {
  module: 'linux-morio-tap',
}

/*
 * Morio stream processors to handle logs data from the linux-morio-tap module
 * We have one handler to cache all logs from this module
 */
export default [
  logsProcessor({
    ...dflts,
    datasets: ['tap-log'],
    idSuffix: '_logs',
    handler: (params) => params.settings.cache
      ? params.tools.cache.logline(params.data.morio?.tap?.log, params)
      : null,
  }),
  logsProcessor({
    ...dflts,
    datasets: ['tap-error-log'],
    idSuffix: '_errors',
    handler: (params) => params.settings.cache
      ? params.tools.cache.logline(params.data.morio?.tap?.error_log, params)
      : null,
  }),
]
