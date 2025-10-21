import { auditSummary } from './_lib.mjs'

/*
 * This handler is for audit data of type: changed-audit-configuration
 *
 * @param {object} params - The full params passed to each handler
 */
export default function changedAuditConfiguration (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { settings, tools } = params

  // Cache audit data
  if (settings.cache) {
    const summary = auditSummary(params)
    const evt = {
      ...summary,
      title: '',
      type: `${summary.module}.changed-audit-configuration`,
    }
    if (!evt.data) evt.data = {}
    // This type of audit message covers multiple changes
    if (summary.data?.op === 'add_rule') evt.title = `Audit rule added`
    else if (summary.data?.op === 'remove_rule') evt.title = `Audit rule removed`
    else if (summary.data?.op === 'set' && summary.data?.audit_enabled === "1") {
      evt.title = `Audit enabled`
      if (summary.data.old === summary.data.audit_enabled) evt.title += ' (no change)'
      else evt.title += ' (was disabled)'
    }
    else evt.title = `Audit configuration change`
    evt.title += ` on ${tools.shortUuid(summary.host)}`

    tools.cache.audit(evt, settings)
  }

  // FIXME: eventify audit data
}
