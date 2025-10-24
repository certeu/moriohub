import { userLifecycleEvent } from './_lib.mjs'

/*
 * This handler is for audit data of type: deleted-group-account-from
 *
 * @param {object} params - The full params passed to each handler
 */
export default function deletedUserAccount (params) {
  if (!params.settings.cache && !params.settings.eventify) return false

  const { settings, tools } = params
  const evt = userLifecycleEvent(params)

  // Cache audit data
  if (settings.cache) tools.cache.audit(evt, settings)

  // Eventify audit data
  if (settings.eventify) tools.produce.event(evt)
}
