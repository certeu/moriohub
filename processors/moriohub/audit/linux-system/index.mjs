/*
 * We keep the handler for each dataset in their own file
 * That makes it easy for people to override an implementation
 * by replacing only that specific file
 */
import addedGroupAccountTo from './added-group-account-to.mjs'
import boot from './boot.mjs'
import changedAuditConfiguration from './changed-audit-configuration.mjs'
import deletedGroupAccountFrom from './deleted-group-account-from.mjs'
import deletedUserAccountFrom from './deleted-user-account-from.mjs'
import endedSession from './ended-session.mjs'
import loggedIn from './logged-in.mjs'
import startedSession from './started-session.mjs'
import userAdded from './user_added.mjs'
import userRemoved from './user_removed.mjs'

// Allow extra imports here
import extra from './_extra.mjs'
// Shared code
import { config, auditSummary } from './_lib.mjs'

/*
 * Morio stream processors to handle audit data from the linux-system module
 * We have one handler per dataset
 */
export default Object.entries({
  "added-group-account-to": addedGroupAccountTo,
  "boot": boot,
  "changed-audit-configuration": changedAuditConfiguration,
  "deleted-group-account-from": deletedGroupAccountFrom,
  "deleted-user-account-from": deletedUserAccountFrom,
  "logged-in": loggedIn,
  "started-session": startedSession,
  "ended-session": endedSession,
  "user_added": userAdded,
  "user_removed": userRemoved,
  ...extra,
}).map(([set, handler]) => typeof handler === 'function'
  ? config(set, handler)
  : undefined
)
