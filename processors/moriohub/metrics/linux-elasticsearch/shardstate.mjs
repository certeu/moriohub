/*
 * Cached shardstate metrics.
 * Note that these are not metrics provided by the default elasticsearch
 * module in metricbeat. This is specific to the morio module for elasticsearch.
 */
export default function shardstate (params) {
  const { data, settings, tools } = params
  const indices = data.http?.elasticsearch?.routing_table?.indices
  if (settings.cache && indices) {
    // Create lookup table for node names
    const nodes = {}
    for (const [id, node] of Object.entries(data.http.elasticsearch.nodes)) nodes[id] = node.name
    // We need to refactor this data somewhat
    const shards = {}
    for (const node of Object.values(nodes)) shards[node] = []
    for (const index in indices) {
      for (const [id, shardlist] of Object.entries(indices[index].shards)) {
        for (const shard of shardlist) {
          shards[nodes[shard.node]].push({
            ...shard,
            fra: shard.relocation_failure_info?.failed_attempts || 0,
            state: shard.state.toLowerCase(),
            node: undefined,
            allocation_id: undefined,
            relocation_failure_info: undefined,
          })
        }
      }
    }
    const stats = {}
    for (const node of Object.values(nodes)) stats[node] = {
      pri: shards[node].filter(shard => shard.primary).length,
      rep: shards[node].filter(shard => !shard.primary).length,
      started: shards[node].filter(shard => shard.state === 'started').length,
      initializing: shards[node].filter(shard => shard.state === 'initializing').length,
      unassigned: shards[node].filter(shard => shard.state === 'unassigned').length,
      relocating: shards[node].filter(shard => shard.state === 'relocating').length,
      fra: shards[node].filter(shard => shard.fra).length
    }
    // Now cache this summary
    params.tools.cache.metricset({
      nodes: Object.keys(stats),
      shards: stats,
      cluster: data.http.elasticsearch?.cluster_name
    }, params)
  }
}
