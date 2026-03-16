// Active prep times (minutes) per component, keyed by component ID.
// "active" = hands-on time; does not include unattended simmering/chilling.
export const COMPONENT_TIMES = {
  // ── Shimla ──────────────────────────────────────────────────────────
  shimla_honeydew_concentrate: { active: 20 },
  shimla_sorbet_swirl:         { active: 15 },
  shimla_cuke_jalapeno_syrup:  { active: 20 },
  shimla_base:                 { active: 35 },
  shimla_toasted_rice_crunch:  { active: 15 },
  // ── Calcutta ────────────────────────────────────────────────────────
  calcutta_chai_base:          { active: 40 },
  calcutta_fudge_ripple:       { active: 20 },
  // ── Kerala ──────────────────────────────────────────────────────────
  kerala_curry_leaf_ghee:      { active: 10 },
  kerala_pineapple_butter:     { active: 20 },
  kerala_candied_ginger:       { active: 30 },
  kerala_ice_cream_base:       { active: 35 },
  kerala_roasted_pineapple:    { active: 15 },
  // ── Goa ─────────────────────────────────────────────────────────────
  goa_passionfruit_reduction:  { active: 20 },
  goa_jalebi_crumble:          { active: 10 },
  goa_coconut_base:            { active: 35 },
  goa_mix_ins:                 { active: 15 },
}

export const CHURN_ACTIVE_MIN = 10

// Parse "YYYY-MM-DD" at local noon to avoid timezone-shift surprises.
export function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/**
 * Builds the full production schedule for an order.
 *
 * Returns null if no pickupDate is set (practice mode).
 *
 * Returns:
 *   {
 *     makeAheadItems,     // [{ flavorId, flavorName, components[] }]
 *     freshDairyDateLabel,
 *     churnDateLabel,
 *     pickupDateLabel,
 *     days,              // sorted soonest → churn day
 *     totalPints,
 *   }
 *
 * Each day:
 *   { offset, date, dateLabel, daysBeforeLabel, isChurnDay, flavorGroups[], totalActiveMin }
 *
 * Each flavorGroup:
 *   { flavorId, flavorName, tasks[] }
 *
 * Each task:
 *   { componentId, componentName, activeMin, isChurn }
 */
export function buildSchedule(order, flavorMap) {
  if (!order.pickupDate) return null

  const pickup     = parseLocalDate(order.pickupDate)
  const totalPints = order.flavors.reduce((s, f) => s + f.pints, 0)

  // ── Collect make-ahead items ──────────────────────────────────────────
  const makeAheadItems = []
  for (const { flavorId } of order.flavors) {
    const flavor      = flavorMap[flavorId]
    const makeAheads  = flavor.components.filter(c => c.make_ahead)
    if (makeAheads.length > 0) {
      makeAheadItems.push({ flavorId, flavorName: flavor.name, components: makeAheads })
    }
  }

  // ── Build days map: offset → { flavorGroupsMap, totalActiveMin } ──────
  const daysMap = {}

  function ensureDay(offset) {
    if (!daysMap[offset]) daysMap[offset] = { flavorGroupsMap: {}, totalActiveMin: 0 }
    return daysMap[offset]
  }

  function ensureGroup(day, flavorId, flavorName) {
    if (!day.flavorGroupsMap[flavorId]) {
      day.flavorGroupsMap[flavorId] = { flavorId, flavorName, tasks: [] }
    }
    return day.flavorGroupsMap[flavorId]
  }

  // Regular (non-make-ahead) components
  for (const { flavorId } of order.flavors) {
    const flavor      = flavorMap[flavorId]
    const regularComps = flavor.components.filter(c => !c.make_ahead)

    for (const comp of regularComps) {
      // calendar_offset = -(timeline_days - day + 1)
      const offset    = -(flavor.timeline_days - comp.day + 1)
      const day       = ensureDay(offset)
      const group     = ensureGroup(day, flavorId, flavor.name)
      const activeMin = COMPONENT_TIMES[comp.id]?.active ?? 20
      group.tasks.push({ componentId: comp.id, componentName: comp.name, activeMin, isChurn: false })
      day.totalActiveMin += activeMin
    }
  }

  // Churn & freeze task — always at offset -1 for every flavor
  for (const { flavorId } of order.flavors) {
    const flavor = flavorMap[flavorId]
    const day    = ensureDay(-1)
    const group  = ensureGroup(day, flavorId, flavor.name)
    group.tasks.push({
      componentId:   `${flavorId}_churn`,
      componentName: 'Churn & freeze',
      activeMin:     CHURN_ACTIVE_MIN,
      isChurn:       true,
    })
    day.totalActiveMin += CHURN_ACTIVE_MIN
  }

  // ── Assemble sorted day array ─────────────────────────────────────────
  const offsets = Object.keys(daysMap).map(Number).sort((a, b) => a - b)

  const days = offsets.map(offset => {
    const date = new Date(pickup)
    date.setDate(date.getDate() + offset)
    const absOffset = Math.abs(offset)
    return {
      offset,
      date,
      dateLabel:      formatDate(date),
      daysBeforeLabel: offset === -1
        ? 'Churn day — 1 day before pickup'
        : `${absOffset} day${absOffset !== 1 ? 's' : ''} before pickup`,
      isChurnDay:     offset === -1,
      flavorGroups:   Object.values(daysMap[offset].flavorGroupsMap),
      totalActiveMin: daysMap[offset].totalActiveMin,
    }
  })

  // ── Date labels ───────────────────────────────────────────────────────
  const freshDairyDate = new Date(pickup)
  freshDairyDate.setDate(freshDairyDate.getDate() - 2)

  const churnDate = new Date(pickup)
  churnDate.setDate(churnDate.getDate() - 1)

  return {
    makeAheadItems,
    freshDairyDateLabel: formatDate(freshDairyDate),
    churnDateLabel:      formatDate(churnDate),
    pickupDateLabel:     formatDate(pickup),
    days,
    totalPints,
  }
}
