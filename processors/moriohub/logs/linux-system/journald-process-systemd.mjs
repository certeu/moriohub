/*
 * This handler looks at systemd logs to eventify starting/stopping of services
 *
 * @param {object} params - The full params passed to each handler
 */
export default function journaldProcessSystemd(params) {
  if (!params.settings.eventify) return false

  if (['Started ', 'Stopped '].includes((params.data?.message || '').slice(0,8))) {
    const { data, tools } = params
    const result = data.message.match(
      new RegExp(`(Started|Stopped) ([^\.]+).service `)
    )
    // Don't bother if we did not match
    if (!result || !result[1] || !result[2]) {
      tools.cache.note(`Did not match the systemd log line for a started/stopped service`, { data, result })
      return
    }
    // Filter out user sessions
    if (
      result[2].slice(0,5) === 'user@' ||
      result[2].slice(0,8) === 'session-' ||
      result[2].slice(0,17) === 'user-runtime-dir@'
    ) return

    // Create the event
    const host = tools.extract.host(data)
    const hostname = tools.extract.hostname(data)
    const type = [params.module, 'systemd', 'service', result[1] === 'Started' ? 'started' : 'stopped']
    const context = tools.create.context(...type.slice(3), result[1], host)
    const hash = tools.create.hash(type.join('.')+context)
    const evt = {
      // Time of the event
      time: tools.extract.timestamp(data),
      // Host & Hostname
      host,
      hostname,
      // Topic, module, and dataset
      topic: params.topic,
      module: params.module,
      dataset: params.dataset,
      // Type, context, hash
      type: type.join('.'),
      context,
      hash,
      // Titles
      title: `Service ${result[1].toLowerCase()}: ${result[2]} on ${hostname}`,
      md_title: `Service ${result[1].toLowerCase()}: ${result[2]} ` +
      `on ${tools.link.md.inventory.host(host, hostname)} ` +
      `${tools.link.md.audit.log(host, params.module, params.dataset, ':receipt:')}` +
      `[:question:](https://docs.cert.europa.eu/docs/reference/data/morio/events/${type.join('.')}/)`,
    }

    // Procude event
    tools.produce.event(evt)
  }
}
