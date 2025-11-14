/*
 * - Caches filesytem metricset.
 * - Eventifies when free space for a mountpoint is above settings.max_used
 * - Mount points with no files are ignored
 */
export default function filesystem (params) {
  // Don't bother if a filesystem has zero files
  if (!params.data.system.filesystem.files) return

  const { data, settings, tools } = params
  if (settings.cache) tools.cache.metricset(
    {
      files: data.system.filesystem.files,
      mount_point: data.system.filesystem.mount_point,
      used: data.system.filesystem.used.pct,
    },
    params
  )

  if (
    settings.eventify &&
    settings.max_used &&
    data.system.filesystem.used.pct > settings.max_used
  ) {
    // Create event
    const host = tools.extract.host(data)
    const hostname = tools.extract.hostname(data)
    const type = [params.topic, params.module, params.dataset, 'mount-used-high']
    const evt = {
      type: type.join('.'),
      context: tools.create.context(...type, host, data.system.filesystem.mount_point),
      time: tools.extract.timestamp(data),
      host,
      hostname,
      topic: params.topic,
      module: params.module,
      dataset: params.dataset,
      title: `Mount ${data.system.filesystem.mount_point} ` +
        `on ${hostname} ` +
        `is used for ${Math.round(data.system.filesystem.used.pct * 1000)/10}%`,
      md_title: `Mount ${data.system.filesystem.mount_point} ` +
        `on ${tools.link.md.inventory.host(host, hostname)} ` +
        `is used for ${Math.round(data.system.filesystem.used.pct * 1000)/10}%`,
      data: {
        files: data.system.filesystem.files,
        mount_point: data.system.filesystem.mount_point,
        used: data.system.filesystem.used.pct,
      },
    }
    evt.hash = tools.create.hash(evt.type+evt.context)

    // Procude event
    tools.produce.event(evt)
  }
}

export const settings = {
  max_used: {
    dflt: 0.9,
    title: `At what percentage of disk space should we trigger an event? (zero to disable)`,
    type: 'number'
  },
}
