import { auditSummary } from "./_lib.mjs"

/*
 * This handler is for audit data of type: logged-in
 *
 * @param {object} params - The full params passed to each handler
 */
export default function loggedIn (params) {
  if (!params.settings.eventify) return false

  const { data, tools, settings } = params
  const summary = auditSummary(params)
  const evt = {
    ...summary,
    title: `logged-in: Login`,
    md_title: `logged-in: Login`,
    type: `${params.topic}.${params.module}.${params.dataset}`,
  }
  if (!evt.data) evt.data = {}
  if (data.user?.effective?.name) {
    evt.title += ` by ${data.user?.effective?.name}`
    evt.md_title += ` by ${tools.link.md.audit.user(data.user?.effective?.name)}`
  }
  evt.title += ` on ${summary.hostname} (${tools.shortUuid(summary.host)}) (tty: ${summary.data?.terminal})`
  evt.md_title += ` on ${summary.hostname} (${tools.link.md.inventory.host(summary.host, tools.shortUuid(summary.host))} (tty: ${summary.data?.terminal})`

  // Eventify audit data
  tools.produce.event(evt)
}



