/*
 * Eventifies index_recovery metrics. No caching (currently).
 */
export default function index_recovery (params) {
  const { data, tools, settings } = params
  const reco = data.elasticsearch?.index?.recovery;
  const timestamp = tools.extract.timestamp(data)
  // Cache
  if (settings.cache && reco) {
    const key = tools.create.key("metric", tools.extract.host(data), params.module, params.dataset)

    tools.valkey.pipeline()
      .zadd(
        key,
        "GT",
        timestamp,
        JSON.stringify({
          index: data.elasticsearch?.index?.name,
          files: reco.index?.files?.percent
            ? Number(reco.index.files.percent.replace("%", ""))
            : undefined,
          translog: reco.translog?.percent
            ? Number(reco.translog.percent.replace("%", ""))
            : undefined,
          from: reco.source?.name || undefined,
          to: reco.target?.name || undefined,
          name: reco.name,
          primary: reco.primary
        })
      )
      .zremrangebyscore(key, 666, timestamp - 45000)
      .exec(result => tools.cache.logErrors(result, { in: "index_recovery", settings, data }))
  }

  // Eventify
  if (settings.eventify) {
    if (reco) {
      const done = `(Files: ${reco.index.files.percent}, Translog: ${reco.translog.percent})`
      tools.produce.event({
        context: tools.create.context(
          params.topic,
          params.module,
          params.dataset,
          data.elasticsearch.cluster.id,
          "index_recovery"
        ),
        time: timestamp,
        title: `Elasticsearch index ${data.elasticsearch.index.name} is relocating ${reco.source ? "from " + reco.source.name : ""}${reco.target ? "to " + reco.target.name : ""} ${done}`,
        md_title: `Elasticsearch index ${data.elasticsearch.index.name} is relocating ${reco.source ? "from " + reco.source.name : ""}${reco.target ? "to " + reco.target.name : ""} ${done}`,
        type: "elasticsearch.index_recovery",
        data: {
          recovery: reco,
          cluster: data.elasticsearch.cluster
        },
        module: params.module,
        topic: params.topic,
        dataset: params.dataset
      })
    } else {
      tools.note("Index recovery", data);
    }
  }
}



