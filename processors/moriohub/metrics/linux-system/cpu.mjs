/*
 * Caches cpu metricset. Does not (currently) eventify.
 */
export default function cpu (params) {
  if (params.settings.cache) return params.tools.cache.metricset(
    {
      idle: params.data.system.cpu.idle.norm.pct,
      iowait: params.data.system.cpu.iowait.norm.pct,
      nice: params.data.system.cpu.nice.norm.pct,
      irq: params.data.system.cpu.irq.norm.pct,
      softirq: params.data.system.cpu.softirq.norm.pct,
      steal: params.data.system.cpu.steal.norm.pct,
      system: params.data.system.cpu.system.norm.pct,
      total: params.data.system.cpu.total.norm.pct,
      user: params.data.system.cpu.user.norm.pct,
    },
    params
  )
}
