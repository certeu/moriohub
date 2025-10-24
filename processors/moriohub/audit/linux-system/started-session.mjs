import { userSessionEvent } from './_lib.mjs'

/*
 * This handler is for audit data of type: started-session
 *
 * @param {object} params - The full params passed to each handler
 */
export default function startedSession (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { tools, settings } = params
  const evt = userSessionEvent(params)

  // Cache audit data
  if (settings.cache) tools.cache.audit(evt, settings)

  // Eventify audit data
  if (settings.eventify) tools.produce.event(evt)
}

