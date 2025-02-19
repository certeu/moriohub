/**
 * This is a Morio stream processor to build out an inventory.
 * It is closely integrated with the Morio Tap service,
 * and if you are looking to write your own stream processor
 * this is perhaps not the best example as it is more complex
 * than most processors, and relies on specific Morio features.
 */

/*
 * A Morio stream processor to build an inventory
 *
 * This is really three stream processors in a trench coat.
 *
 * @param {object} data - The data from RedPanda
 * @param {obectt} tools - The tools object
 * @param {string} topic - The topic the data came from
 */
export default function inventoryStreamProcessor (data, tools, topic) {
  if (topic === 'metrics') return metricsProcessor(data, tools, topic)
  if (topic === 'inventory') return inventoryProcessor(data, tools, topic)
  if (topic === 'audit') return auditProcessor(data, tools, topic)
}

/*
 * A Morio stream processor to update the inventory based on audit data
 *
 * This method will be called for ever incoming message on the audit topic
 *
 * @param {object} data - The data from RedPanda
 * @param {obectt} tools - The tools object
 * @param {string} topic - The topic the data came from
 */
function auditProcessor (data, tools, topic) {
  /*
   * FIXME: Is there any audit event we should track for the inventory?
   * for example, the 'existing_user' action could be tracked to compile
   * a list of user accounts on a given system.
   */
  return
}

/*
 * A Morio stream processor to update the inventory
 *
 * This method will be called for ever incoming message on the inventory topic
 *
 * @param {object} data - The data from RedPanda
 * @param {obectt} tools - The tools object
 * @param {string} topic - The topic the data came from
 */
function inventoryProcessor (data, tools, topic) {
  if (isInventoryUpdate(data, tools)) tools.inventory.host.update(data, tools)
}

/*
 * A Morio stream processor to update the inventory based on metrics data
 *
 * This method will be called for ever incoming message on the metrics topic
 *
 * @param {object} data - The data from RedPanda
 * @param {obectt} tools - The tools object
 * @param {string} topic - The topic the data came from
 */
function metricsProcessor (data, tools, topic) {
  /*
   * Only process inventory updates
   */
  if (!isInventoryUpdate(data, tools)) return

  /*
   * Do not process hosts that lack an ID
   */
  if (!data.host.id) tools.note(`Host lacks ID: : ${JSON.stringify(data)}`)

  /*
   * Transform host data
   */
  const module = tools.get(data, ['labels' ,'morio.module'], false)
  const host = extractInventoryDataFromMetrics[module](data, tools)

  /*
   * Only update if we have data
   */
  if (host) tools.produce.inventoryUpdate({
    host,
    labels: {
      'morio.inventory.update': true,
      'morio.module': module
    }
  })
}

/**
 * Helper method to keep the module check DRY
 *
 * @param {object} data - The data from RedPanda
 * @param {object} tools - The tap tools object
 * @return {bool} match - true if it is an inventory update, false if not
 */
function isInventoryUpdate(data, tools) {
  return (tools.get(data, ['labels', 'morio.module'], false) === 'linux-morio-inventory')
    ? true
    : false
}

/**
 * Normalises an IP address into a standard format (supports both IPv4 and IPv6)
 *
 * Note that at CERT-EU, we default to EN_UK spelling, which means we write
 * (or try to write) normalise in our documentation and comments.
 * However, localising method names, that's where madness lies.
 *
 * @param {string} ip - The IP address to normalise
 * @param {string} tools - The tools object (used in case of trouble)
 * @returns {string} - The normalized IP address
 */
function normalizeIp(ip, tools) {
  // Do not continue if the IP is not valid
  if (typeof ip !== 'string' || !tools.ipaddr.isValid(ip)) {
    tools.note(`Cannot parse IP address: ${JSON.stringify(ip)}`)
    return false
  }

  // Parse the IP
  const address = tools.ipaddr.parse(ip)

  return address.kind() === "ipv4"
    ? address.toString()
    : address.toNormalizedString()
}

/**
 * Normalise a MAC address into a standard format (lowercase, colon-separated).
 *
 * Note that at CERT-EU, we default to EN_UK spelling, which means we write
 * (or try to write) normalise in our documentation and comments.
 * However, localising method names, that's where madness lies.
 *
 * @param {string} mac - The MAC address to normalize
 * @param {string} tools - The tools object (used in case of trouble)
 * @returns {string} - The normalized MAC address
 */
function normalizeMac (mac, tools ) {
  if (typeof mac !== 'string') {
    tools.note(`Invalid MAC address: ${JSON.stringify(mac)}`)
    return false
  }

  /*
   * Keep only the hexadecimal characters (remove colons, dashes, dots, and so on)
   * That should result in a string that is 12 characters long (or 6 bytes)
   */
  const hexOnly = mac.replace(/[^0-9a-f]/gi, '')
  if (hexOnly.length !== 12 || !/^[0-9a-f]{12}$/i.test(hexOnly)) {
    return tools.note('Invalid MAC address', { mac, host: data.host })
  }

  /*
   * Now normalize into ab:cd:ef:12:34:56 format and return
   */
  return hexOnly
    .toLowerCase() // No yelling
    .match(/.{1,2}/g) // Split per 2 characters
    .join(':'); // Glue back together with ':' characters
}

const extractInventoryDataFromMetrics = {
  /**
   * Extract inventory data from the linux-system module
   *
   * @param {object} data - The data from kafka
   * @param {object} tools - The tools object
   * @return {object} host - The inventory host data
   */
  'linux-morio-inventory': function linuxMorioInventory (data={}, tools) {

    const host = {
      // data.host.id is always set when we get to this point
      id: data.host.id,
    }

    // Host name
    if (data.host?.hostname) host.name = tools.clean(data.host.name)

    // Host fqdn
    if (data.host?.name) host.fqdn = tools.clean(data.host.name)

    // Architecture
    if (data.host?.architecture) host.arch = tools.clean(data.host.architecture)

    // Memory
    if (data.system?.memory?.total) host.memory = data.system.memory.total

    // IP addresses
    if (data.host?.ip) host.ip = data.host.ip.map(ip => normalizeIp(ip, tools)).filter(ip => ip)

    // Mac addresses
    if (data.host?.mac) host.mac = data.host.mac.map(mac => normalizeMac(mac, tools)).filter(mac => mac)

    // OS
    if (data.host?.os) host.os = data.host.os

    // Cores
    if (data.system?.load?.cores) host.cores = data.system.load.cores

    // Do not update the inventory unless we've got sufficient data
    return (Object.keys(host).length > 5) ? host : false
  },
}

const extractInventoryDataFromAudit = {
  /**
   * Extract inventory data from the linux-system audit module
   *
   * @param {object} data - The data from kafka
   * @param {object} tools - The tools object
   * @return {object} host - The inventory host data
   */
  'linux-system': function linuxSystemAudit (data={}, tools) {

    /*
     * Re-use logic from metrics data, if possible
     */
    const hostDataFromMetrics = extractInventoryDataFromMetrics['linux-system'](data, tools)
    const host = hostDataFromMetrics
      ? hostDataFromMetrics
      : {
        // data.host.id is always set when we get to this point
        id: data.host.id,
      }

    // Inventory state update for a host includes the timezone
    //if (data.event?.kind === 'state' && data.event?.dataset === 'host' && data.system?.audit?.host?.fixme) {
    //  if (typeof host.pkgs === 'undefined') host.pkgs = new Set()
    //  host.pkgs.add(data.package)
    //
    //  tools.note('Audit inventory existing package', host)
    //  return host
    //}

    // Existing packages
    if (data.event?.action === 'existing_package' && data.package) {
      if (typeof host.pkgs === 'undefined') host.pkgs = new Set()
      host.pkgs.add(data.package)

      tools.note('Audit inventory existing package', host)

      return host
    }

    // Things we ignore
    if ([
      "changed-audit-configuration",
      "existing_user",
      "network_flow",
    ].includes(data.event?.action)) return false

    tools.note(`Audit/Inventory: ${data.event?.action}`, { host, data })

    // Do not update the inventory with only host info
    return false
  }
}

/*
 * This is used for both the UI and to generate the default settings
 */
export const info = {
  info: `This stream processor will process data from various topics to build out an inventory of your infrastructure.

It can only be enabled or disabled, and requires no configuration.`,
  settings: {
    topics: ['audit', 'inventory', 'metrics'],
  }
}
