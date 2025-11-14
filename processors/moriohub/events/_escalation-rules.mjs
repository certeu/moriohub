/*
 * To save us some typing and keep this config DRY,
 * we reuse these objects to configure certain events
 */

/*
 * - Generate a notification
 */
const notify = { notify: true }

/*
 * - Generate an alert
 * - Do exponential backoff
 */
const alert = { alert: true, backoff: true }

/*
 * - Generate an alarm
 * - Do exponential backoff
 */
const alarm = { alarm: true, backoff: true }

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
    on: ({ count }) => count < 2,
    notify: true,
    backoff: true
  },
  {
    on: ({ count }) => count > 1,
    alarm: true,
    backoff: true
  },
]

const note = true

export const rules = {
  unmatched: note,
  never: [
    "session-started",
    "session-ended",
  ],
  on: {
    "filesystem.mount_point.used.high": ({ data }) => (data.morio?.event?.data?.used > 0.97) ? alarm : alert,
    "http.healthcheck.down": healthcheck,
  },
}
