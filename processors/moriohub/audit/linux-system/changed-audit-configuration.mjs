import { auditSummary } from './_lib.mjs'

/*
 * This handler is for audit data of type: changed-audit-configuration
 *
 * @param {object} params - The full params passed to each handler
 */
export default function changedAuditConfiguration (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { settings, tools } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `${summary.dataset}: `,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}
  // This type of audit message covers multiple changes
  if (summary.data?.op === 'add_rule') {
    evt.title += `Audit rule added`
    evt.md_title += `Audit rule added`
  }
  else if (summary.data?.op === 'remove_rule') {
    evt.title += `Audit rule removed`
    evt.md_title += `Audit rule removed`
  }
  else if (summary.data?.op === 'set' && summary.data?.audit_enabled === "1") {
    evt.title = `Audit enabled`
    evt.md_title = `Audit enabled`
    if (summary.data.old === summary.data.audit_enabled) {
      evt.title += ' (no change)'
      evt.md_title += ' (no change)'
    }
    else {
      evt.title += ' (was disabled)'
      evt.md_title += ' (was disabled)'
    }
  }
  else {
    evt.title = `Audit configuration change (fixme: unhandled)`
    evt.md_title = `Audit configuration change (fixme: unhandled)`
  }
  if (data.user?.name) {
    evt.title += ` (by: ${data.user?.name})`
    evt.md_title += ` (by: ${tools.link.md.audit.user(data.user?.name)}`
  }
  evt.title += ` on ${summary.hostname} (${tools.shortUuid(summary.host)}) (tty: ${summary.data?.terminal})`
  evt.md_title += ` on ${summary.hostname} (${tools.link.md.inventory.host(summary.host, tools.shortUuid(summary.host))} (tty: ${summary.data?.terminal})`

  // Cache audit data
  if (settings.cache) tools.cache.audit(evt, settings)

  // Eventify audit data
  if (settings.eventify) tools.produce.event(evt)
}
