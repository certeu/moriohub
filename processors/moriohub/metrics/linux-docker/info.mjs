/*
 * Caches info metricsets. Does not (currently) eventify.
 */
export default function info (params) {
  if (params.settings.cache) {
    params.tools.cache.metricset(params.data.docker.info.containers, params, 'containers')
    params.tools.cache.metricset(params.data.docker.info.images, params, 'images')
  }
}
