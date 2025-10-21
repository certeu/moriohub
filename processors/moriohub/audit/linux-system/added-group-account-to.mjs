import { auditSummary } from './_lib.mjs'

/*
 * This handler is for audit data of type: added-group-account-to
 *
 * @param {object} params - The full params passed to each handler
 */
export default function addedGroupAccountTo (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { data, settings, tools } = params

  // Cache audit data
  if (settings.cache) {
    const summary = auditSummary(params)
    const evt = {
      ...summary,
      title: `New group ${data.group?.name} added by ${data.user?.name} on ${tools.shortUuid(summary.host)}`,
      type: `${summary.module}.${params.dataset}`,
    }
    if (!evt.data) evt.data = {}

    tools.cache.audit(evt, settings)
  }

  // FIXME: eventify audit data
}
