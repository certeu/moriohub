import { rules } from './_escalation_rules.mjs'

export function escalate (params) {
  const { tools, settings } = params

  return tools.cache.note('Escalate this', params)
}
