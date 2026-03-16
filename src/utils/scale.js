// ─── Batch math ───────────────────────────────────────────────────────────────

export function getBatchCount(pints) {
  return Math.ceil(pints / 2)
}

// Scale a per-quart amount by batch count; round to 1 decimal for fl oz, integer for grams
export function scaleAmount(amountPerQuart, batches, unit) {
  const raw = amountPerQuart * batches
  return unit === 'fl_oz' ? Math.round(raw * 10) / 10 : Math.round(raw)
}

// Scale a per-batch amount (make-ahead components) by how many batches to make
export function scaleBatchAmount(amountPerBatch, batches, unit) {
  const raw = amountPerBatch * batches
  return unit === 'fl_oz' ? Math.round(raw * 10) / 10 : Math.round(raw)
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatFlOz(amount) {
  const display = parseFloat(amount.toFixed(1))
  const breakdown = flOzBreakdown(amount)
  return breakdown ? `${display} fl oz (${breakdown})` : `${display} fl oz`
}

function flOzBreakdown(amount) {
  if (amount < 16) return null
  const quarts = Math.floor(amount / 32)
  const afterQuarts = amount - quarts * 32
  const pints = Math.floor(afterQuarts / 16)
  const oz = parseFloat((afterQuarts - pints * 16).toFixed(1))
  const parts = []
  if (quarts > 0) parts.push(`${quarts} qt`)
  if (pints  > 0) parts.push(`${pints} pt`)
  if (oz     > 0) parts.push(`${oz} fl oz`)
  return parts.length ? parts.join(' + ') : null
}

export function formatGrams(amount) {
  return `${amount}g`
}

export function formatAmount(amount, unit) {
  return unit === 'fl_oz' ? formatFlOz(amount) : formatGrams(amount)
}

// ─── Make-ahead logic ─────────────────────────────────────────────────────────

// Parse numeric yield from batch_makes strings like "~285g", "85g"
function parseBatchYield(batchMakes) {
  if (!batchMakes) return null
  const m = batchMakes.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : null
}

// How much of a make-ahead component is consumed, and how many batches to make
export function getMakeAheadNeeds(makeAheadComp, allComponents, quartBatches) {
  const refs = allComponents
    .filter(c => !c.make_ahead)
    .flatMap(c => c.ingredients)
    .filter(i => i.from_component === makeAheadComp.id)

  const totalNeededRaw = refs.reduce((sum, i) => sum + i.amount_per_quart * quartBatches, 0)
  const totalNeeded    = Math.round(totalNeededRaw * 10) / 10
  const unit           = refs[0]?.unit ?? 'g'
  const batchYield     = parseBatchYield(makeAheadComp.batch_makes)
  const batchesNeeded  = batchYield ? Math.ceil(totalNeededRaw / batchYield) : 1

  return { totalNeeded, unit, batchesNeeded, batchYield }
}

// ─── Cost estimate ────────────────────────────────────────────────────────────

export function estimateCost(flavor, quartBatches) {
  let total   = 0
  let hasAny  = false
  let missing = false

  for (const comp of flavor.components) {
    if (comp.make_ahead) continue
    for (const ing of comp.ingredients) {
      if (ing.source === 'from_make_ahead') continue
      const scaled = scaleAmount(ing.amount_per_quart, quartBatches, ing.unit)
      if (ing.cost_per_unit !== null) {
        total += ing.cost_per_unit * scaled
        hasAny = true
      } else {
        missing = true
      }
    }
  }

  return { total: hasAny ? total : null, missing }
}
