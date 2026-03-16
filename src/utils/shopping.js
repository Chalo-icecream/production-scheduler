import { UNIT_COSTS } from '../data/flavors.js'
import { getBatchCount, getMakeAheadNeeds, formatAmount } from './scale.js'

// Maps ingredient names → UNIT_COSTS key for buy-quantity and cost estimates.
// Keyed by exact ingredient name from the data file.
const COST_KEY_MAP = {
  'Whole milk':     'whole_milk',
  'Heavy cream':    'heavy_cream',
  'Cream cheese':   'cream_cheese',
  'Honeydew flesh': 'honeydew_flesh',
  'Honey':          'honey',
}

// Sourcing group definitions in shopping-list display order.
// Labels deliberately differ from SOURCING_GROUPS in flavors.js.
export const SHOPPING_GROUPS = [
  {
    id:      'fresh_only',
    label:   'Fresh dairy',
    sublabel: 'Buy within 2 days of your churn date',
    warning: true,
  },
  {
    id:      'uht_ok',
    label:   'UHT / shelf-stable',
    sublabel: 'Can buy anytime',
    warning: false,
  },
  {
    id:      'produce',
    label:   'Produce',
    sublabel: null,
    warning: false,
  },
  {
    id:      'pantry',
    label:   'Sweeteners & pantry',
    sublabel: null,
    warning: false,
  },
  {
    id:      'specialty',
    label:   'Specialty',
    sublabel: 'Indian grocery or specialty store',
    warning: false,
  },
]

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Aggregates all ingredients across all ordered flavors into shopping groups.
 *
 * Returns:
 *   { groups, totalKnownCost, totalPints, hasUnknownCosts }
 *
 * groups: array of { id, label, sublabel, warning, items[] }
 * items:  { name, unit, source, displayTotal, suggestedBuy }
 * suggestedBuy (if cost known): { units, unitLabel, unitCost, totalCost }
 */
export function buildShoppingList(order, flavorMap) {
  const totalPints = order.flavors.reduce((s, f) => s + f.pints, 0)

  // Accumulate raw totals keyed by `name|source` so fresh vs UHT whole milk
  // stay in separate groups.
  const raw = {} // key → { name, unit, source, rawTotal }

  for (const { flavorId, pints } of order.flavors) {
    const flavor       = flavorMap[flavorId]
    const quartBatches = order.mode === 'practice' ? 1 : getBatchCount(pints)

    for (const comp of flavor.components) {
      if (comp.make_ahead) {
        // Scale make-ahead batch ingredients by how many batches are needed.
        const { batchesNeeded } = getMakeAheadNeeds(comp, flavor.components, quartBatches)
        for (const ing of comp.ingredients) {
          if (ing.source === 'from_make_ahead') continue
          add(raw, ing.name, ing.unit, ing.source, ing.amount_per_batch * batchesNeeded)
        }
      } else {
        for (const ing of comp.ingredients) {
          if (ing.source === 'from_make_ahead') continue
          add(raw, ing.name, ing.unit, ing.source, ing.amount_per_quart * quartBatches)
        }
      }
    }
  }

  // Build display items with buy suggestions.
  let totalKnownCost  = 0
  let hasUnknownCosts = false

  const allItems = Object.values(raw).map(item => {
    // Round total: 1 decimal for fl oz, integer for grams
    const displayTotal = item.unit === 'fl_oz'
      ? Math.round(item.rawTotal * 10) / 10
      : Math.round(item.rawTotal)

    const costKey  = COST_KEY_MAP[item.name]
    const costInfo = costKey ? UNIT_COSTS[costKey] : null
    let suggestedBuy = null

    if (costInfo) {
      const units = Math.ceil(item.rawTotal / costInfo.unit_size)
      const totalCost = parseFloat((units * costInfo.cost).toFixed(2))
      suggestedBuy = { units, unitLabel: costInfo.unit_label, unitCost: costInfo.cost, totalCost }
      totalKnownCost += totalCost
    } else {
      hasUnknownCosts = true
    }

    return { name: item.name, unit: item.unit, source: item.source, displayTotal, suggestedBuy }
  })

  // Group and sort alphabetically within each group.
  const groups = SHOPPING_GROUPS.map(g => ({
    ...g,
    items: allItems
      .filter(i => i.source === g.id)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(g => g.items.length > 0)

  return {
    groups,
    totalKnownCost: parseFloat(totalKnownCost.toFixed(2)),
    totalPints,
    hasUnknownCosts,
  }
}

function add(acc, name, unit, source, amount) {
  const key = `${name}|${source}`
  if (!acc[key]) acc[key] = { name, unit, source, rawTotal: 0 }
  acc[key].rawTotal += amount
}
