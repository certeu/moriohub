import { auditSummary } from './_lib.mjs'

/*
 * This handler is for audit data of type: ran-command
 *
 * @param {object} params - The full params passed to each handler
 */
export default function ranCommand (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { data, tools, settings } = params

  // Cache audit data
  if (settings.cache) {
    const summary = auditSummary(params)
    const evt = {
      ...summary,
      title: `Privileged command execution by ${data.user?.name} on ${tools.shortUuid(summary.host)}`,
      type: `${summary.module}.ran-command`,
    }
    if (!evt.data) evt.data = {}

    tools.cache.audit(evt, settings)
  }

  // FIXME: eventify audit data
}
