/*
 * To save us some typing and keep this config DRY,
 * we reuse these objects to configure certain events
 */

/*
 * - Generate a notification
 */
const notify = { notify: true, expire: 300 }

/*
 * - Generate an alert
 * - Do exponential backoff
 */
const alert = { alert: true, backoff: true, expire: 900 }

/*
 * - Generate an alarm
 * - Do exponential backoff
 */
const alarm = { alarm: true, backoff: true, expire: 86400 }

/*
 * On the first event:
 * - Generate a notification
 * - Do exponential backoff
 * On subsequent events:
 * - Generate an alarm
 * - Do exponential backoff
 */
const healthcheck = [
  {
    on: ({ reps }) => reps < 2,
    notify: true,
    backoff: true,
    expire: 45,
  },
  {
    on: ({ reps }) => reps > 1,
    alarm: true,
    backoff: true,
    expire: 45,
  },
]

const note = true

export const rules = {
  unmatched: note,
  never: [
    "linux-system.ended-session",
    "linux-system.started-session",
  ],
  on: {
    "healthcheck.http.down": healthcheck,
    "linux-system.boot": alert,
    "linux-system.filesystem.mount-used-high": ({ data }) => (data.morio?.event?.data?.used > 0.97) ? alarm : alert,
    "linux-system.shutdown": alert,
    "linux-system.systemd.service.started": notify,
    "linux-system.systemd.service.stopped": notify,
  },
}
