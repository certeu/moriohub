import { rules } from './_escalation-rules.mjs'

export function escalate (params) {
  const { tools, settings } = params

  return tools.cache.note('Escalate this', params)
}
