export default function network_summary (params) {
  if (params.settings.cache) return params.tools.cache.metricset(
    {
      icmp: {
        indu: params.data.system.network_summary.icmp.InDestUnreachs,
        outdu: params.data.system.network_summary.icmp.OutDestUnreachs,
        rlhost: params.data.system.network_summary.icmp.OutRateLimitHost,
      },
      ip: {
        in: params.data.system.network_summary.ip.InOctets,
        out: params.data.system.network_summary.ip.OutOctets,
      },
      tcp: {
        in: params.data.system.network_summary.tcp.InSegs,
        out: params.data.system.network_summary.tcp.OutSegs,
        ce: params.data.system.network_summary.tcp.CurrEstab,
        rt: params.data.system.network_summary.tcp.RetransSegs,
        to: params.data.system.network_summary.tcp.TCPTimeouts,
      },
      udp: {
        in: params.data.system.network_summary.udp.InDatagrams,
        out: params.data.system.network_summary.udp.OutDatagrams,
        err: (
          params.data.system.network_summary.udp.InCsumErrors +
          params.data.system.network_summary.udp.RcvbufErrors +
          params.data.system.network_summary.udp.SndbufErrors +
          params.data.system.network_summary.udp.MemErrors +
          params.data.system.network_summary.udp.InErrors
        ),
        nope: params.data.system.network_summary.udp.NoPorts
      },
    },
    params
  )
}
