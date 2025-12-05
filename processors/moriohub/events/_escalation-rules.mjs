/*
 * To save us some typing and keep this config DRY,
 * we reuse these objects to configure certain events
 */
const presets = {
  alarm: { alarm: true, backoff: true, expire: 86400 },
  alert: { alert: true, backoff: true, expire: 900 },
  healthcheck: escalateFailingHealthcheck,
  note: { note: true },
  notify: { notify: true, expire: 300 },
}

export const rules = {
  unmatched: presets.note,
  never: [
    "linux-system.changed-audit-configuration",
    "linux-system.ended-session",
    "linux-system.logged-in",
    "linux-system.logged-out",
    "linux-system.started-session",
  ],
  on: {
    "healthcheck.docker.unhealthy": presets.healthcheck,
    "healthcheck.http.down": presets.healthcheck,
    "healthcheck.icmp.down": presets.healthcheck,
    "healthcheck.tcp.down": presets.healthcheck,
    "linux-system.boot": presets.alert,
    "linux-system.filesystem.mount-used-high": escalateLowDiskSpace,
    "linux-system.shutdown": presets.alert,
    "linux-system.systemd.service.started": presets.notify,
    "linux-system.systemd.service.stopped": presets.notify,
  },
}

/*
 * Determines what level of escalation to use based on used disk space
 */
function escalateLowDiskSpace({ data }) {
  if (data.morio?.event?.data?.used > 0.97) return presets.alarm
  else return presets.alert
}

/*
 * Determines what level of escalation to use based on healthchech failure repetitions
 */
function escalateFailingHealthcheck({ data, reps=1 }) {
  if (reps > 3) return { alarm: true, backoff: true, expire: 45 }
  if (reps > 1) return { alert: true, backoff: false, expire: 45 }

  return { notify: true, backoff: false, expire: 45 }
}


