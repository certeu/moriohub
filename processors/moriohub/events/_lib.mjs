import { rules } from './_escalation-rules.mjs'

export function escalate (params) {
  const { data, tools, settings } = params


  // We filter on tytpe. Without a type, we won't escalate
  const type = data.morio?.event?.type || false
  if (!type) return

  // If it is in the never set, do not escalate
  if ((rules.never || []).includes(type)) return

  return tools.cache.note(`Escalate event: ${data.morio?.event?.type}`, data)
}
