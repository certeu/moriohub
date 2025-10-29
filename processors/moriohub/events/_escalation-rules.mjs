/*
 * To save us some typing and keep this config DRY,
 * we reuse these objects to configure certain events
 */

/*
 * - Generate a notification
 * - Debounce repeating events within a 5-second window
 */
const notify = {
  notify: true,
  debounce: 5,
}

/*
 * - Generate an alert
 * - Debounce repeating events within a 5-second window
 * - Do exponential backoff
 */
const alert = {
  alert: true,
  debounce: 5,
  backoff: true
}

/*
 * - Generate an alarm
 * - Debounce repeating events within a 5-second window
 * - Do exponential backoff
 */
const alarm = {
  alarm: true,
  debounce: 3,
  backoff: true
}

/*
 * On the first event:
 * - Generate a notification
 * - Debounce repeating events within a 5-second window
 * - Do exponential backoff
 * On subsequent events:
 * - Generate an alarm
 * - Debounce repeating events within a 5-second window
 * - Do exponential backoff
 */
const healthcheck = [
  {
    on: ({ count }) => count < 2,
    notify: true,
    debounce: 3,
    backoff: true
  },
  {
    on: ({ count }) => count > 1,
    alarm: true,
    debounce: 3,
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
    "http.healthcheck.down": healthcheck,
  },
}
