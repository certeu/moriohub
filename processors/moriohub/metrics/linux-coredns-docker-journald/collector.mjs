/*
 * Caches collector metricsets. Does not (currently) eventify.
 */
export default function collector (params) {
  if (params.settings.cache) {
    const { data, tools } = params

    // Handle DNS requests metric
    if (data.prometheus?.metrics?.coredns_dns_requests_total) {
      return tools.cache.metricset(
        {
          zone: data.prometheus.labels.zone,
          proto: data.prometheus.labels.proto,
          type: data.prometheus.labels.type,
          reqs: data.prometheus.metrics.coredns_dns_requests_total
        },
        params,
        "requests"
      )
    }

    // Handle DNS responses metric
    if (data.prometheus?.metrics?.coredns_dns_responses_total) {
      return tools.cache.metricset(
        {
          zone: data.prometheus.labels.zone,
          rcode: data.prometheus.labels.rcode,
          resps: data.prometheus.metrics.coredns_dns_responses_total
        },
        params,
        "responses"
      )
    }

    // Handle memory metrics
    if (data.prometheus?.metrics?.process_resident_memory_bytes) {
      return tools.cache.metricset(
        {
          res: data.prometheus.metrics.process_resident_memory_bytes,
          virt: data.prometheus.metrics.process_virtual_memory_bytes
        },
        params,
        "memory"
      )
    }

    // Handle network metrics
    if (data.prometheus?.metrics?.process_network_transmit_bytes_total) {
      return tools.cache.metricset(
        {
          egress: data.prometheus.metrics.process_network_transmit_bytes_total,
          ingress: data.prometheus.metrics.process_network_receive_bytes_total
        },
        params,
        "network"
      )
    }

    // Log unhandled metricset
    tools.note("CoreDNS unhandled metricset", data)
  }
}
