import { auditSummary } from './_lib.mjs'

/*
 * This handler is for audit data of type: ended-session
 *
 * @param {object} params - The full params passed to each handler
 */
export default function endedSession (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { data, tools, settings } = params

  // Cache audit data
  if (settings.cache) {
    const summary = auditSummary(params)
    const evt = {
      ...summary,
      title: `Session ended by ${data.user?.name}`,
      type: `${summary.module}.ended-session`,
    }
    if (!evt.data) evt.data = {}
    if (data.user?.effective?.name) evt.title += ` (as ${data.user.effective.name})`
    evt.title += ` ${summary.data?.terminal} on ${tools.shortUuid(summary.host)}`

    tools.cache.audit(evt, settings)
  }
  // FIXME: eventify audit data
}
