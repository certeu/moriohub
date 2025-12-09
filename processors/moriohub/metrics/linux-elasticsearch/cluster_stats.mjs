/*
 * Caches cluster_stats metricset. Eventifies cluster status.
 */
export default function cluster_stats (params) {
  const { data, settings, tools } = params
  if (settings.cache) {
    // Default caching
    tools.cache.metricset(data.elasticsearch?.cluster?.stats?.indices, params)
    tools.cache.metricset({ status: data.elasticsearch?.cluster?.stats?.status }, params, 'cluster_status')
  }
  if (settings.eventify) {
    const titles = {
      yellow: `Elasticsearch cluster ${data.elasticsearch.cluster.name} degraded (yellow)`,
      red: `Elasticsearch cluster ${data.elasticsearch.cluster.name} unhealthy (red)`,
      unknown: `Elasticsearch cluster ${data.elasticsearch.cluster.name} status unknown`,
    }
    const status = (data.elasticsearch?.cluster?.stats?.status || 'unknown').toLowerCase()
    // Check cluster status
    if (status !== 'green') tools.produce.event({
      context: tools.create.context(params.topic, params.module, params.dataset, data.elasticsearch.cluster.id, 'status'),
      href: `https://${tools.node.cluster}/boards/metrics/${data.host.id}/${params.module}/cluster_status/status/`,
      time: summary.time,
      title: titles[status],
      md_title: `${titles[status]} [${status}](https://${tools.node.cluster}/boards/metrics/${data.host.id}/${params.module}/cluster_s
tatus/status/)`,
      type: `elasticsearch.cluster.status.${status}`,
      data: {
        status,
        cluster: data.elasticsearch.cluster
      },
      module: summary.module,
      topic: summary.topic,
      dataset: summary.dataset,
    })
  }
}
