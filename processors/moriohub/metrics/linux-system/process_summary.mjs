/*
 * Caches the process_summary metricset. Does not (currently) eventify.
 */
export default function process_summary ({ data, tools, settings }) {
  if (settings.cache) return ['process_summary', data.system.process.summary]

  return false
}
