/*
 * Eventifies docker healthchecks. Caches healthcheck duration.
 */
export default function healthcheck (params) {
  if (!params.settings.cache && !params.settings.eventify) return

  // Save us some typing
  const { data, tools, topic, module, dataset } = params
  const hc = data.docker.healthcheck

  // How long did the healthcheck take?
  const ms = new Date(hc.event.end_date).getTime() - new Date(hc.event.start_date).getTime()

  // Cache duration
  if (params.settings.cache) {
    params.tools.cache.metricset({
      took: ms,
      up: hc.status === 'healthy' ? 1 : 0,
      status: hc.status,
      name: data.container.name,
      image: data.container.image.name
    }, params)
  }

  // Eventify if status is not healthy
  if (params.settings.eventify && hc.status !== 'healthy') {
    tools.produce.event({
      context: tools.create.context(topic, 'healthcheck.docker.unhealthy', data.host.id, data.container.name),
      href: `https://${tools.node.cluster}/boards/metrics/show/metric|${data.host.id}|linux-docker|healthcheck_${data.container.name}`,
      time: tools.time.when(data),
      title: `Container unhealthy: ${data.container.name} on ${data.host.name || tools.shortUuid(data.host.id)} (${data.container.image.name})`,
      md_title: `Container unhealthy: ${data.container.name} on ${tools.link.md.inventory.host(data.host.id, data.host.name || tools.shortUuid(data.host.id))} (${data.container.image.name})`,
      type: 'healthcheck.docker.unhealty',
      data: {
        container: {
          id: data.container.name,
          name: data.container.name,
          image: data.container.image.name
        }
      },
      topic,
      module,
      dataset,
    })
  }
}
