export default {
  cluster_stats: ({ data, formatBytes, formatNumber, lineChart }) => lineChart([
    // Docs
    {
      id: 'docs',
      title: 'Elasticsearch Cluster Stats: Documents',
      yName: 'Documents',
      yFmt: (val) => formatNumber(val),
      series: [{
        name: `Documents`,
        path: `docs.total`,
      }]
    },
    {
      id: 'docsps',
      title: 'Elasticsearch Cluster Stats: Documents per Second',
      yName: 'Docs/s',
      yFmt: (val) => formatNumber(val,'/s'),
      series: [{
        name: `Docs/s`,
        path: `docs.total`,
        div: 30,
      }]
    },
    // Field Data
    {
      id: 'fielddata',
      title: 'Elasticsearch Cluster Stats: Fielddata Memory',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: [{
        name: `Bytes`,
        path: `fielddata.memory.bytes`,
      }]
    },
    // Shards
    {
      id: 'shards',
      title: 'Elasticsearch Cluster Stats: Shards',
      yName: 'Shards',
      yFmt: (val) => formatNumber(val),
      series: ['count', 'primaries'].map(item => ({
        name: `Shards: ${item}`,
        path: `shards.${item}`,
      }))
    },
    // Store
    {
      id: 'store',
      title: 'Elasticsearch Cluster Stats: Store Size',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: ['size', 'total_data_set_size'].map(item => ({
        name: `Store size: ${item}`,
        path: `store.${item}.bytes`,
      }))
    },
  ],data),
  "cluster_status": ({ data, templates, clone, formatBytes, formatNumber, chartGradient }) => {
    const latest = data.pop()
    const chart = {
      id: 'status',
      title: {
        text: 'Elasticsearch Cluster Status',
      },
      graphic: {
        elements: [{
          type: 'text',
          top: 'center',
          left: 'center',
          style: {
            text: latest.status.toUpperCase(),
            fontSize: 120,
            fontWeigth: 'bold',
            fill: latest.status,
            stroke: 'currentColor',
            background: 'green',
          },
        }]
      }
    }

    return [chart]
  },
  index_summary: ({ data, formatBytes, formatNumber, lineChart }) => lineChart([
    // Docs
    {
      id: 'docs',
      title: 'Elasticsearch Index Summary: Documents',
      yName: 'Docs',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Documents: ${item}`,
        path: `${item}.docs.count`,
      }))
    },
    {
      id: 'docsps',
      title: 'Elasticsearch Index Summary: Documents per Second',
      yName: 'Docs',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Documents: ${item}`,
        path: `${item}.docs.count`,
        div: 30,
      }))
    },
    // Indexing count
    {
      id: 'icount',
      title: 'Elasticsearch Index Summary: Indexing Count',
      yName: 'Count',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Count: ${item}`,
        path: `${item}.indexing.index.count`,
      }))
    },
    {
      id: 'icountps',
      title: 'Elasticsearch Index Summary: Indexing Count per Second',
      yName: 'Count',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Count: ${item}`,
        path: `${item}.indexing.index.count`,
        div: 30,
      }))
    },
    // Indexing time
    {
      id: 'itime',
      title: 'Elasticsearch Index Summary: Indexing Time',
      yName: 'ms',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Indexing time: ${item}`,
        path: `${item}.indexing.index.time.ms`,
      }))
    },
    {
      id: 'itimeps',
      title: 'Elasticsearch Index Summary: Indexing Time in ms/s',
      yName: 'ms',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Indexing time: ${item}/s`,
        path: `${item}.indexing.index.time.ms`,
        div: 30,
      }))
    },
    // Query Count
    {
      id: 'qcount',
      title: 'Elasticsearch Index Summary: Query Count',
      yName: 'ms',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Query count: ${item}`,
        path: `${item}.search.query.count`,
      }))
    },
    {
      id: 'qcountps',
      title: 'Elasticsearch Index Summary: Query Count per Second',
      yName: 'Queries',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Query count/s: ${item}`,
        path: `${item}.search.query.count`,
        div: 30
      }))
    },
    // Query Time
    {
      id: 'qtime',
      title: 'Elasticsearch Index Summary: Query Time',
      yName: 'ms',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Query count: ${item}`,
        path: `${item}.search.query.time.ms`,
      }))
    },
    {
      id: 'qtimeps',
      title: 'Elasticsearch Index Summary: Query Time in ms/s',
      yName: 'ms',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Query count/s: ${item}`,
        path: `${item}.search.query.time.ms`,
        div: 30
      }))
    },
    // Segments
    {
      id: 'segments',
      title: 'Elasticsearch Index Summary: Segments',
      yName: 'ms',
      yFmt: (val) => formatNumber(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Segments: ${item}`,
        path: `${item}.segments.count`,
      }))
    },
    // Segments Memory
    {
      id: 'segmem',
      title: 'Elasticsearch Index Summary: Segments Memory',
      yName: 'ms',
      yFmt: (val) => formatBytes(val),
      series: ['primaries', 'total'].map(item => ({
        name: `Segments Memory: ${item}`,
        path: `${item}.segments.memory.bytes`,
      }))
    },
    // Store
    {
      id: 'store',
      title: 'Elasticsearch Index Summary: Store Size',
      yName: 'Bytes',
      yFmt: (val) => {
        console.log(data)
        return formatBytes(val)
      },
      series: ['primaries', 'total'].map(item => ({
        name: `Store: ${item}`,
        path: `${item}.store.size.bytes`,
      }))
    },
    {
      id: 'storeps',
      title: 'Elasticsearch Index Summary: Store Size Change per Second',
      yName: 'Bytes/s',
      yFmt: (val) => formatBytes(Math.abs(val)),
      series: ['primaries', 'total'].map(item => ({
        name: `Store: ${item}`,
        path: `${item}.store.size.bytes`,
        div: 30,
      }))
    },
  ],data),
  node: ({ data, formatBytes, formatNumber, lineChart }) => lineChart([
    {
      id: 'vvmmem',
      title: 'Elasticsearch Node: JVM Memory Size',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: ['heap.init', 'heap.max', 'nonheap.init', 'nonheap.max'].map(item => ({
        name: `Segments Memory: ${item}`,
        path: `${item}.bytes`,
      }))
    },
  ],data),
  node_stats: ({ data, templates, clone, get, formatBytes, formatNumber, chartGradient, lineChart }) => lineChart([
    // fs
    {
      id: 'ioops',
      title: 'Elasticsearch IO Operations per second',
      yName: 'Count',
      yFmt: (val) => formatNumber(val),
      series: ['read', 'write'].map(type => ({
        name: `IO Operations/s: ${type}`,
        path: `fs.io_stats.total.${type}.operations.count`,
        div: 30,
      }))
    },
    {
      id: 'iobps',
      title: 'Elasticsearch IO Bytes per second',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val*1024),
      series: ['read', 'write'].map(type => ({
        name: `Filesystem: ${type}`,
        path: `fs.io_stats.total.${type}.kb`,
        div: 30,
      }))
    },
    {
      id: 'fssum',
      title: 'Elasticsearch Filesystem Summary',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: ['available', 'free', 'total'].map(type => ({
        name: `Filesystem: ${type}`,
        path: `fs.summary.${type}.bytes`,
        div: 1,
      }))
    },
    // indexing_pressure
    {
      id: 'ipress',
      title: 'Elasticsearch Indexing Pressure',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: ['coordinating', 'primary', 'replica'].map(type => ({
        name: `Indexing pressure: ${type}`,
        path: `indexing_pressure.memory.current.${type}.bytes`,
        div: 1,
      }))
    },
    // indices
    {
      id: 'ibat',
      title: 'Elasticsearch Indices: Bulk average time',
      yName: 'count',
      series: [{
        name: 'Indices: Bulk average time',
        path: 'indices.bulk.avg_time.ms',
        div: 1,
      }]
    },
    {
      id: 'idc',
      title: 'Elasticsearch Indices: Docs per second',
      yName: 'count',
      series: [{
        name: 'Indices: Docs per second',
        path: 'indices.docs.count',
        div: 30,
      }]
    },
    {
      id: 'idd',
      title: 'Elasticsearch Indices: Docs Deleted',
      yName: 'count',
      series: [{
        name: 'Indices: Docs Deleted',
        path: 'indices.docs.deleted',
        div: 1,
      }]
    },
    {
      id: 'ifdm',
      title: 'Elasticsearch Indices: Fielddata Memory',
      yName: 'bytes',
      yFmt: (val) => formatBytes(val),
      series: [{
        name: 'Indices: Fielddata Memory',
        path: 'indices.fielddata.memory.bytes',
        div: 1,
      }]
    },
    {
      id: 'ifdi',
      title: 'Elasticsearch Indices: Fielddata Evictions',
      yName: 'count',
      series: [{
        name: 'Indices: Fielddata Evictions',
        path: 'indices.fielddata.evictions.count',
        div: 30,
      }]
    },
    {
      id: 'ifc',
      title: 'Elasticsearch Indices: Flushes per second',
      yName: 'count',
      series: [{
        name: 'Indices: Flushes per second',
        path: 'indices.flush.total.count',
        div: 30,
      }]
    },
    {
      id: 'ift',
      title: 'Elasticsearch Indices: Flush time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Flush time in ms/s',
        path: 'indices.flush.total_time.ms',
        div: 30,
      }]
    },
    {
      id: 'igc',
      title: 'Elasticsearch Indices: Gets per second',
      yName: 'count',
      series: [{
        name: 'Indices: Gets per second',
        path: 'indices.get.total.count',
        div: 30,
      }]
    },
    {
      id: 'igt',
      title: 'Elasticsearch Indices: Get time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Get time in ms/s',
        path: 'indices.get.time.ms',
        div: 30,
      }]
    },
    {
      id: 'iis',
      title: 'Elasticsearch Indices: Indexes per second',
      yName: 'count',
      series: [{
        name: 'Indices: Indexes per second',
        path: 'indices.indexing.index_total.count',
        div: 30,
      }]
    },
    {
      id: 'iit',
      title: 'Elasticsearch Indices: Index time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Index time in ms per second',
        path: 'indices.indexing.index_time.ms',
        div: 30,
      }]
    },
    {
      id: 'itt',
      title: 'Elasticsearch Indices: Throttle time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Throttle time in ms per second',
        path: 'indices.indexing.throttle_time.ms',
        div: 30,
      }]
    },
    {
      id: 'ims',
      title: 'Elasticsearch Indices: Merges per second',
      yName: 'count',
      series: [{
      name: 'Indices: Merges per second',
      path: 'indices.merges.total.count',
      div: 30,
      }]
    },
    {
      id: 'imt',
      title: 'Elasticsearch Indices: Merge time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Merge time in ms per second',
        path: 'indices.merges.total_time.ms',
        div: 30,
      }]
    },
    {
      id: 'iqc',
      title: 'Elasticsearch Indices: Query Cache',
      yName: 'bytes',
      yFmt: (val) => formatBytes(val),
      series: [{
        name: 'Indices: Query Cache',
        path: 'indices.query_cache.memory.bytes',
        div: 1,
      }]
    },
    {
      id: 'ibo',
      title: 'Elasticsearch Indices: Bulk operations per second',
      yName: 'count',
      series: [{
        name: 'Indices: Bulk operations per second',
        path: 'indices.bulk.operations.total.count',
        div: 30,
      }]
    },
    {
      id: 'ibas',
      title: 'Elasticsearch Indices: Bulk operations average size',
      yName: 'bytes',
      yFmt: (val) => formatBytes(val),
      series: [{
        name: 'Indices: Bulk operations avg size',
        path: 'indices.bulk.avg_size.bytes',
        div: 1,
      }]
    },
    {
      id: 'irc',
      title: 'Elasticsearch Indices: Refreshes per second',
      yName: 'count',
      series: [{
        name: 'Indices: Refreshes per second',
        path: 'indices.refresh.total.count',
        div: 30,
      }]
    },
    {
      id: 'irt',
      title: 'Elasticsearch Indices: Refresh time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Refresh time in ms per second',
        path: 'indices.refresh.total_time.ms',
        div: 30,
      }]
    },
    {
      id: 'ircache',
      title: 'Elasticsearch Indices: Request Cache',
      yName: 'bytes',
      yFmt: (val) => formatBytes(val),
      series: [{
        name: 'Indices: Request Cache',
        path: 'indices.request_cache.memory.bytes',
        div: 1,
      }]
    },
    {
      id: 'iqfc',
      title: 'Elasticsearch Indices: Search fetches per second',
      yName: 'count',
      series: [{
        name: 'Indices: Search fetches per second',
        path: 'indices.search.fetch_total.count',
        div: 30,
      }]
    },
    {
      id: 'iqft',
      title: 'Elasticsearch Indices: Search fetch time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Search fetch time in ms per second',
        path: 'indices.search.fetch_time.ms',
        div: 30,
      }]
    },
    {
      id: 'iqsc',
      title: 'Elasticsearch Indices: Search queries per second',
      yName: 'count',
      series: [{
        name: 'Indices: Search queries per second',
        path: 'indices.search.query_total.count',
        div: 30,
      }]
    },
    {
      id: 'iqst',
      title: 'Elasticsearch Indices: Search query time in ms per second',
      yName: 'ms',
      series: [{
        name: 'Indices: Search query time in ms per second',
        path: 'indices.search.query_time.ms',
        div: 30,
      }]
    },
    {
      id: 'isegs',
      title: 'Elasticsearch Indices: Segments',
      yName: 'count',
      series: [{
        name: 'Indices: Segments',
        path: 'indices.segments.count',
      }]
    },
    {
      id: 'isegsmem',
      title: 'Elasticsearch Indices: Segments Memory',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: ['doc_values', 'fixed_bit_set', 'index_writer', 'norms', 'points', 'stored_fields', 'term_vectors', 'terms', 'version_map'].map(item => ({
        name: `Indices: Segment memory - ${item}`,
        path: `indices.segments.${item}.memory.bytes`,
      }))
    },
    {
      id: 'ishards',
      title: 'Elasticsearch Indices: Shards',
      yName: 'Count',
      series: [{
        name: `Indices: Shards`,
        path: `indices.shard_stats.total_count`,
      }]
    },
    {
      id: 'istore',
      title: 'Elasticsearch Indices: Store Size',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: ['size', 'total_data_set_size'].map(item => ({
        name: `Indices: Store Size - ${item}`,
        path: `indices.store.${item}.bytes`,
      }))
    },
    {
      id: 'itlops',
      title: 'Elasticsearch Indices: Translog Operations',
      yName: 'Count',
      series: [{
        name: `Indices: Translog Operations`,
        path: `indices.translog.operations.count`,
      }]
    },
    {
      id: 'itlsize',
      title: 'Elasticsearch Indices: Translog Size',
      yName: 'Bytes',
      yFmt: (val) => formatBytes(val),
      series: [{
        name: `Indices: Translog Size`,
        path: `indices.translog.size.bytes`,
      }]
    },
    // ingest
    {
      id: 'inps',
      title: 'Elasticsearch Ingest: Per second',
      yName: 'Count',
      series: [{
        name: `Ingest: Per second`,
        path: `ingest.total.count`,
        div: 30,
      }]
    },
    {
      id: 'inms',
      title: 'Elasticsearch Ingest: Time in ms per second',
      yName: 'Count',
      series: [{
        name: `Ingest: Time in ms/s`,
        path: `ingest.total.time_in_millis`,
        div: 30,
      }]
    },
    {
      id: 'incf',
      title: 'Elasticsearch Ingest: Current & Failed',
      yName: 'Count',
      series: ['current', 'failed'].map(item => ({
        name: `Ingest: ${item}`,
        path: `ingest.total.${item}`,
      }))
    },
    // JVM
    {
      id: 'jvmgcc',
      title: 'Elasticsearch JVM: GC Count per second',
      yName: 'Count',
      series: ['old', 'young'].map(item => ({
        name: `JVM GS Count/s: ${item}`,
        path: `jvm.gc.collectors.${item}.collection.count`,
        div: 30,
      }))
    },
    {
      id: 'jvmgcms',
      title: 'Elasticsearch JVM: GC Time in ms per second',
      yName: 'ms',
      series: ['old', 'young'].map(item => ({
        name: `JVM GS Time in ms/s: ${item}`,
        path: `jvm.gc.collectors.${item}.collection.ms`,
        div: 30,
      }))
    },
    {
      id: 'jvmhu',
      title: 'Elasticsearch JVM: Heap Use',
      yName: '%',
      series: [{
        name: `JVM Heap Used %`,
        path: `jvm.mem.heap.used.pct`,
      }]
    },
    {
      id: 'jvmt',
      title: 'Elasticsearch JVM: Threads',
      yName: 'Count',
      series: [{
        name: `JVM Threads`,
        path: `jvm.threads.count`,
      }]
    },
    // OS
    {
      id: 'oscput',
      title: 'Elasticsearch OS: CPU Throttle',
      yName: 'Count',
      series: ['time_throttled.ns', 'times_throttled.count'].map(item => ({
        name: `CPU: ${item}`,
        path: `os.cgroup.cpu.stat.${item}`,
      }))
    },
    {
      id: 'os1ml',
      title: 'Elasticsearch OS: 1-minute Load Average',
      yName: 'Load',
      series: [{
        name: `1-minute Load Avg`,
        path: `os.cpu.load_avg.1m`,
      }]
    },
    // Process
    {
      id: 'pofd',
      title: 'Elasticsearch Process: Open File Descriptors',
      yName: 'FDs',
      series: [{
        name: `Open file descriptors`,
        path: `process.open_file_descriptors`,
      }]
    },
    // Thread Pool
    {
      id: 'ptp',
      title: 'Elasticsearch Process: Thread Pool',
      yName: 'Threads',
      series: [
        'esql_worker',
        'flush',
        'force_merge',
        'get',
        'search',
        'snapshot',
        'system_read',
        'system_write',
        'write'
      ].flatMap(x => ['active', 'rejected', 'queue'].map(y => `${x}.${y}`)).map(item => ({
        name: item,
        path: `thread_pool.${item}.count`,
      }))
    },
    // Transport
    {
      id: 'transc',
      title: 'Elasticsearch Transport: Packets per Second',
      yName: 'Packets/s',
      yFmt: (val) => formatNumber(val),
      series: ['rx', 'tx'].map(item => ({
        name: `Packets/s: ${item === 'tx' ? 'Egress' : 'Ingress'}`,
        path: `transport.${item}.count`,
        div: 30,
        valFmt: (val) => (item === 'tx' ? val : val*-1)
      }))
    },
    {
      id: 'transb',
      title: 'Elasticsearch Transport: Bandwidth',
      yName: 'bps',
      yFmt: (val) => (formatBytes(Math.abs(val), 'ps')).toLowerCase(),
      series: ['rx', 'tx'].map(item => ({
        name: `bps: ${item === 'tx' ? 'Egress' : 'Ingress'}`,
        path: `transport.${item}.size.bytes`,
        div: 30,
        valFmt: (val) => (item === 'tx' ? val*8 : val*-8)
      }))
    },
  ], data),
}
