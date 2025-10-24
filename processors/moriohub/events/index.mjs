import { escalate } from './_lib.mjs'

/*
 * A Morio stream processor to handle events data
 *
 * This is designed to handle data in the 'events' topic.
 */
export default {
  id: 'moriohub_events',
  info: `This stream processor will process event data flowing through your Morio collection.

It can cache recent events, and supports dynamic loading of module-specific logic.`,
  settings: {
    topics: ['events'],
    cache: {
      dflt: true,
      title: 'Cache event data',
      type: 'list',
      list: [
        {
          val: false,
          label: 'Do not cache event data (disable)',
        },
        {
          val: true,
          label: 'Cache recent event data',
          about: 'Caching event data allows consulting it through the dashboards provided by Morio&apos;s UI service'
        },
      ],
    },
    escalate: {
      dflt: true,
      title: 'Escalate based on event data',
      type: 'list',
      list: [
        {
          val: false,
          label: 'Do not escalate based on event data (disable)',
        },
        {
          val: true,
          label: 'Escalate based on event data',
          about: 'This will fan out events to the notifications/alerts/alarms topics based on the rules you set.',
        },
      ],
    },
    cap: {
      dflt: 250,
      title: 'Maximum number of events to cache',
      about: 'This is a hard limit.',
      labelBL: 'In cached events',
      type: 'number'
    },
    hostCap: {
      dflt: 25,
      title: 'Events per-host cache entry limit',
      type: 'number',
    },
    userCap: {
      dflt: 25,
      title: 'Maximum number of per-user audit messages to cache',
      type: 'number',
    },
  },
  handler,
}

/*
 * This handler is for event data
 *
 * @param {object} params - The full params passed to each handler
 */
function handler (params) {
  const { data, tools, settings } = params
  if (settings.cache) tools.cache.event(data, settings)
  if (settings.escalate) escalate(params)
}

