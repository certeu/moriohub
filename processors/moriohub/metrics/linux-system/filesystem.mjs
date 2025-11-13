
/*
 * Caches filesytem metricset.
 */
export default function filesystem (params) {
  if (params.settings.cache) return params.tools.cache.metricset(
    {
      files: params.data.system.filesystem.files,
      mount_point: params.data.system.filesystem.mount_point,
      used: params.data.system.filesystem.used.pct,
    },
    params
  )
}

