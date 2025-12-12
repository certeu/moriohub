/*
 * Caches cluster_stats metricset. Eventifies cluster status.
 */
export default function cluster_stats (params) {
  // Only proceed if we have the data
  if (!params.data.elasticsearch?.cluster?.stats) {
    return params.tools.note(`No elasticsearch.cluster.stats in metrics`, params.data)
  }

  const { data, settings, tools } = params

  // Cache
  if (settings.cache) {
    tools.cache.metricset(data.elasticsearch.cluster.stats.indices, params)
    tools.cache.metricset({ status: data.elasticsearch.cluster.stats.status }, params, 'cluster_status')
  }

  // Eventify
  if (settings.eventify) {
    const titles = {
      yellow: `Elasticsearch cluster ${data.elasticsearch?.cluster?.name} degraded`,
      red: `Elasticsearch cluster ${data.elasticsearch.cluster.name} unhealthy`,
      unknown: `Elasticsearch cluster ${data.elasticsearch.cluster.name} status unknown`,
    }
    const status = (data.elasticsearch?.cluster?.stats?.status || 'unknown').toLowerCase()
    // Check cluster status
    if (status !== 'green') tools.produce.event({
      context: tools.create.context(params.topic, params.module, params.dataset, data.elasticsearch.cluster.id, 'status'),
      time: tools.extract.timestamp(data),
      title: titles[status],
      md_title: `${titles[status]} ${tools.link.md.to('/boards/metrics/'+data.host.id+'/'+params.module+'/cluster_status/status/')}`,
      type: `elasticsearch.cluster.status.${status}`,
      data: {
        status,
        cluster: data.elasticsearch.cluster
      },
      module: params.module,
      topic: params.topic,
      dataset: params.dataset,
    })
  }
}
