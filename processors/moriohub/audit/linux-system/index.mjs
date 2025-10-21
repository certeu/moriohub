/*
 * We keep the handler for each metricset in their own file
 * That makes it easy for people to override an implementation
 * by replacing only that specific file
 */
import addedGroupAccountTo from './added-group-account-to.mjs'
import changedAuditConfiguration from './changed-audit-configuration.mjs'
import deleteGroupAccountFrom from './delete-group-account-from.mjs'
import ranCommand from './ran-command.mjs'
import startedSession from './started-session.mjs'
import endedSession from './ended-session.mjs'
// Allow extra imports here
import extra from './_extra.mjs'
// Shared code
import { config, auditSummary } from './_lib.mjs'

/*
 * Morio stream processors to handle metrics from the linux-system module
 * We have one handler per metricset
 */
export default Object.entries({
  "added-group-account-to": addedGroupAccountTo,
  "changed-audit-configuration": changedAuditConfiguration,
  "delete-group-account-from": deleteGroupAccountFrom,
  "ran-command": ranCommand,
  ...extra,
}).map(([set, handler]) => typeof handler === 'function'
  ? config(set, handler)
  : undefined
)
