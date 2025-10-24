import { auditSummary } from './_lib.mjs'

/*
 * This handler is for audit data of type: boot
 *
 * @param {object} params - The full params passed to each handler
 */
export default function boot (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { settings, tools } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `${summary.dataset}: System boot on ${summary.hostname} (${tools.shortUuid(summary.host)})`,
    md_title: `${summary.dataset}: System boot on ${summary.hostname} (${tools.link.md.inventory.host(summary.host, tools.shortUuid(summary.host))})`,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}

  // Cache audit data
  if (settings.cache) tools.cache.audit(evt, settings)

  // Eventify audit data
  if (settings.eventify) tools.produce.event(evt)
}
