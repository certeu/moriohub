import { auditSummary } from './_lib.mjs'

/*
 * This handler is for audit data of type: shutdown
 *
 * @param {object} params - The full params passed to each handler
 */
export default function shutdown (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { settings, tools } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `${summary.dataset}: System shutdown on ${summary.hostname} (${tools.shortUuid(summary.host)})`,
    md_title: `${summary.dataset}: System shutdown on [${summary.hostname}](${tools.link.md.inventory.host(summary.host)})`,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}

  // Cache audit data
  if (settings.cache) tools.cache.audit(evt, settings)

  // Eventify audit data
  if (settings.eventify) tools.produce.event(evt)
}
