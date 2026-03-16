import { useState, Fragment } from 'react'
import { FLAVOR_MAP } from '../data/flavors.js'
import {
  getBatchCount,
  scaleAmount,
  scaleBatchAmount,
  formatAmount,
  getMakeAheadNeeds,
  estimateCost,
} from '../utils/scale.js'
import styles from './YieldCalculator.module.css'

export default function YieldCalculator({ order }) {
  const [checkedIds, setCheckedIds] = useState(new Set())
  const isPractice = order.mode === 'practice'

  function toggleCheck(id) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className={`${styles.flavorGrid} ${order.flavors.length > 1 ? styles.flavorGridMulti : ''}`}>
        {order.flavors.map(({ flavorId, pints }) => {
          const flavor     = FLAVOR_MAP[flavorId]
          const batches    = isPractice ? 1 : getBatchCount(pints)
          return (
            <FlavorCard
              key={flavorId}
              flavor={flavor}
              pints={pints}
              batches={batches}
              isPractice={isPractice}
              checkedIds={checkedIds}
              onToggleCheck={toggleCheck}
            />
          )
        })}
    </div>
  )
}

// ─── FlavorCard ───────────────────────────────────────────────────────────────

function FlavorCard({ flavor, pints, batches, isPractice, checkedIds, onToggleCheck }) {
  const makeAheadComponents = flavor.components.filter(c => c.make_ahead)
  const regularComponents   = flavor.components
    .filter(c => !c.make_ahead)
    .sort((a, b) => a.day - b.day)

  // Group regular components by day for notebook-style day dividers
  const byDay = regularComponents.reduce((acc, comp) => {
    ;(acc[comp.day] ??= []).push(comp)
    return acc
  }, {})
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)

  const { total: costTotal, missing: costMissing } = estimateCost(flavor, batches)

  // Pre-compute cross-component ingredient totals.
  // Iterate in render order (regularComponents is already sorted by day) so
  // lastIngId ends up on the last-rendered occurrence of each name.
  const ingTotals = {}
  for (const comp of regularComponents) {
    for (const ing of comp.ingredients) {
      if (ing.source === 'from_make_ahead') continue
      const key = ing.name
      if (!ingTotals[key]) {
        ingTotals[key] = { count: 0, rawTotal: 0, unit: ing.unit, hint: null, lastIngId: null }
      }
      ingTotals[key].count++
      ingTotals[key].rawTotal += ing.amount_per_quart
      ingTotals[key].hint      = ing.total_hint ?? ingTotals[key].hint
      ingTotals[key].lastIngId = ing.id
    }
  }
  // Keep only ingredients that appear in 2+ components
  const dupTotals = Object.fromEntries(
    Object.entries(ingTotals).filter(([, v]) => v.count >= 2)
  )

  return (
    <article className={styles.flavorCard}>

      {/* ── Flavor header ─────────────────────────────────────────── */}
      <header className={styles.flavorHeader}>
        <div>
          <h2 className={styles.flavorName}>{flavor.name}</h2>
          <p className={styles.flavorDescriptor}>{flavor.descriptor}</p>
        </div>
        <div className={styles.batchBadge}>
          {isPractice ? (
            <span className={styles.batchCount}>1 batch</span>
          ) : (
            <>
              <span className={styles.batchCount}>{batches} batch{batches !== 1 ? 'es' : ''}</span>
              <span className={styles.batchNote}>{pints} pints = {batches} × 1 qt</span>
            </>
          )}
        </div>
      </header>

      {/* ── Make-ahead section ────────────────────────────────────── */}
      {makeAheadComponents.length > 0 && (
        <section className={styles.makeAheadSection}>
          <h3 className={styles.makeAheadHeading}>Make-ahead — have these ready</h3>
          <div className={styles.makeAheadCards}>
            {makeAheadComponents.map(comp => {
              const { totalNeeded, unit, batchesNeeded, batchYield } =
                getMakeAheadNeeds(comp, flavor.components, batches)
              const checked = checkedIds.has(comp.id)

              return (
                <div
                  key={comp.id}
                  className={`${styles.makeAheadCard} ${checked ? styles.makeAheadCardDone : ''}`}
                >
                  <label className={styles.makeAheadLabel}>
                    <input
                      type="checkbox"
                      className={styles.makeAheadCheckbox}
                      checked={checked}
                      onChange={() => onToggleCheck(comp.id)}
                    />
                    <span className={styles.makeAheadName}>{comp.name}</span>
                  </label>
                  <p className={styles.makeAheadMeta}>
                    <span className={styles.makeAheadKeeps}>Keeps {comp.keeps}</span>
                    <span className={styles.makeAheadDot}>·</span>
                    <span>
                      Need {totalNeeded}{unit === 'g' ? 'g' : ' fl oz'} &rarr;&nbsp;
                      <strong>{batchesNeeded} batch{batchesNeeded !== 1 ? 'es' : ''}</strong>
                      {batchYield ? ` (~${batchYield}${unit === 'g' ? 'g' : ' fl oz'} per batch)` : ''}
                    </span>
                  </p>
                  <ul className={styles.ingredientList}>
                    {comp.ingredients.map(ing => {
                      const scaled = scaleBatchAmount(ing.amount_per_batch, batchesNeeded, ing.unit)
                      return (
                        <IngredientRow key={ing.id} ingredient={ing} scaled={scaled} />
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Day sections ──────────────────────────────────────────── */}
      <div className={styles.daySections}>
        {days.map(day => (
          <section key={day} className={styles.daySection}>
            <div className={styles.dayDivider}>
              <span className={styles.dayLabel}>Day {day}</span>
              <span className={styles.dayRule} aria-hidden="true" />
            </div>

            {byDay[day].map(comp => {
              const visibleIngredients = comp.ingredients.filter(
                i => i.source !== 'from_make_ahead'
              )
              if (visibleIngredients.length === 0) return null
              return (
                <div key={comp.id} className={styles.componentBlock}>
                  <h4 className={styles.componentName}>{comp.name}</h4>
                  <ul className={styles.ingredientList}>
                    {visibleIngredients.map(ing => {
                      const scaled = scaleAmount(ing.amount_per_quart, batches, ing.unit)
                      const dup    = dupTotals[ing.name]
                      const isLast = dup?.lastIngId === ing.id
                      const scaledTotal = isLast
                        ? scaleAmount(dup.rawTotal, batches, dup.unit)
                        : null
                      return (
                        <Fragment key={ing.id}>
                          <IngredientRow ingredient={ing} scaled={scaled} />
                          {isLast && (
                            <li className={styles.totalCallout} aria-label={`Total ${ing.name}`}>
                              ↳ Total {ing.name.toLowerCase()} needed:{' '}
                              <strong>{formatAmount(scaledTotal, dup.unit)}</strong>
                              {dup.hint && <> — {dup.hint}</>}
                            </li>
                          )}
                        </Fragment>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </section>
        ))}
      </div>

      {/* ── Cost estimate footer ──────────────────────────────────── */}
      <footer className={styles.costFooter}>
        <span className={styles.costLabel}>Estimated ingredient cost</span>
        {costTotal !== null ? (
          <span className={styles.costValue}>
            ${costTotal.toFixed(2)}
            {costMissing && <span className={styles.costPartial}> (partial)</span>}
          </span>
        ) : (
          <span className={styles.costEmpty}>
            — <span className={styles.costHint}>add ingredient costs to see estimate</span>
          </span>
        )}
      </footer>

    </article>
  )
}

// ─── IngredientRow ────────────────────────────────────────────────────────────

function IngredientRow({ ingredient, scaled }) {
  return (
    <li className={styles.ingredientRow}>
      <span className={styles.ingName}>
        {ingredient.name}
        {ingredient.notes && (
          <span className={styles.ingNote}>{ingredient.notes}</span>
        )}
      </span>
      <span className={styles.ingAmount}>
        {formatAmount(scaled, ingredient.unit)}
      </span>
    </li>
  )
}
