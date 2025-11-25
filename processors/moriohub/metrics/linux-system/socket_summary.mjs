/*
 * Caches the socket_summary metricset. Does not (currently) eventify.
 */
export default function socket_summary (params) {
  if (params.settings.cache && params.data.system?.socket?.summary) {
    return params.tools.cache.metricset(
      {
        all: params.data.system.socket.summary.all,
        tcp: params.data.system.socket.summary.tcp.all,
        udp: params.data.system.socket.summary.udp.all,
      },
      params
    )
  }
}
