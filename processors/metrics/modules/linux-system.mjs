/**
 * A method to determine metricset and metrics for the morio-system module
 *
 * @param {object} data - The full message from RedPanda
 * @param {object} tools - The tools object
 * @return {array} result - A [metricset(string), metrics(object)] array
 */
export default function (data={}, tools) {

  // Disk IO
  if (data.metricset?.name === 'diskio') {
    // This metricset generates different events
    if (data.system?.diskio) return ['diskio', data.system.diskio]
    if (data.host?.disk?.["read.bytes"]) return ['diskio', data.host.disk]
  }

  // System Load
  if (data.metricset?.name === 'load') {
    return ['load', data.system.load]
  }

  // Memory
  if (data.metricset?.name === 'memory') {
    return [
      'memory',
      {
        actual: data.system.memory.actual.used.pct,
        swap: data.system.memory.swap.used.pct,
        used: data.system.memory.used.pct,
      }
    ]
  }

  // Network summary
  if (data.metricset?.name === 'network_summary') {
    return [
      'network_summary',
      {
        icmp: {
          indu: data.system.network_summary.icmp.InDestUnreachs,
          outdu: data.system.network_summary.icmp.OutDestUnreachs,
          rlhost: data.system.network_summary.icmp.OutRateLimitHost,
        },
        ip: {
          in: data.system.network_summary.ip.InOctets,
          out: data.system.network_summary.ip.OutOctets,
        },
        tcp: {
          in: data.system.network_summary.tcp.InSegs,
          out: data.system.network_summary.tcp.OutSegs,
          ce: data.system.network_summary.tcp.CurrEstab,
          rt: data.system.network_summary.tcp.RetransSegs,
          to: data.system.network_summary.tcp.TCPTimeouts,
        },
        udp: {
          in: data.system.network_summary.udp.InDatagrams,
          out: data.system.network_summary.udp.OutDatagrams,
          err: (
            data.system.network_summary.udp.InCsumErrors +
            data.system.network_summary.udp.RcvbufErrors +
            data.system.network_summary.udp.SndbufErrors +
            data.system.network_summary.udp.MemErrors +
            data.system.network_summary.udp.InErrors
          ),
          nope: data.system.network_summary.udp.NoPorts
        },
      }
    ]
  }

  // Process summary
  if (data.metricset?.name === 'process_summary') {
    return ['process_summary', data.system.process.summary]
  }

  // Socket summary
  if (data.metricset?.name === 'socket_summary') {
    return [
      'socket_summary',
      {
        all: data.system.socket.summary.all,
        tcp: data.system.socket.summary.tcp.all,
        udp: data.system.socket.summary.udp.all,
      }
    ]
  }

  /*
   * Anything else we do not cache
   */
  return false
}

export const info = {
  info: `This stream processor plugin will process metrics data from the linux-system module.`,
}

