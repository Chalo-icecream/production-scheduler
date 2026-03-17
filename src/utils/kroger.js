// Client-side utility for Kroger price data.
// All actual API calls go through /api/kroger (Vercel serverless function)
// so credentials never leave the server.

// ── Ingredient catalog ────────────────────────────────────────────────────────

export const TRACKED_INGREDIENTS = [
  // Fresh dairy — spoilage risk; must be bought close to churn date
  { id: 'whole_milk',   name: 'Whole milk',   term: 'whole milk gallon',             unit: 'gallon', category: 'dairy'   },
  { id: 'heavy_cream',  name: 'Heavy cream',  term: 'heavy whipping cream quart',    unit: 'qt',     category: 'dairy'   },
  { id: 'cream_cheese', name: 'Cream cheese', term: 'philadelphia cream cheese 8oz', unit: '8 oz',   category: 'dairy'   },
  { id: 'butter',       name: 'Butter',       term: 'unsalted butter',               unit: 'lb',     category: 'dairy'   },
  // Pantry
  { id: 'honey',        name: 'Honey',        term: 'honey',                         unit: 'jar',    category: 'pantry'  },
  { id: 'sugar',        name: 'Sugar',        term: 'granulated sugar',              unit: 'bag',    category: 'pantry'  },
  // Produce
  { id: 'limes',        name: 'Limes',        term: 'limes',                         unit: 'ea',     category: 'produce' },
  { id: 'jalapeno',     name: 'Jalapeño',     term: 'jalapeño',                      unit: 'ea',     category: 'produce' },
  { id: 'cucumber',     name: 'Cucumber',     term: 'english cucumber',              unit: 'ea',     category: 'produce' },
]

export const DAIRY_IDS = new Set(['whole_milk', 'heavy_cream', 'cream_cheese', 'butter'])

// ── Fetch helpers ─────────────────────────────────────────────────────────────

/**
 * Fetches live Ralphs prices for all tracked ingredients.
 * Returns an object keyed by ingredient id:
 *   { regular, promo, description, size }  — success
 *   { error: string }                      — ingredient-level error
 *   null                                   — product found but no price data
 */
export async function fetchKrogerPrices() {
  const results = {}

  await Promise.allSettled(
    TRACKED_INGREDIENTS.map(async (ing) => {
      try {
        const res = await fetch(`/api/kroger?action=search&term=${encodeURIComponent(ing.term)}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        results[ing.id] = extractBestPrice(data)
      } catch (err) {
        results[ing.id] = { error: err.message }
      }
    })
  )

  return results
}

/**
 * Picks the first product in the Kroger response that has price data.
 * Returns { regular, promo, description, size } or null.
 */
function extractBestPrice(krogerData) {
  const items = krogerData.data ?? []
  for (const item of items) {
    const priceObj = item.items?.[0]?.price
    if (priceObj?.regular != null) {
      return {
        regular:     priceObj.regular,
        promo:       priceObj.promo   ?? null,
        description: item.description ?? '',
        size:        item.items?.[0]?.size ?? '',
      }
    }
  }
  return null // response OK but no price data in any result
}
