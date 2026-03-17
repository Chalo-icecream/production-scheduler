import { useState } from 'react'
import { TRACKED_INGREDIENTS, DAIRY_IDS, fetchKrogerPrices } from '../utils/kroger.js'
import styles from './PriceTracker.module.css'

const CATEGORIES = [
  { id: 'dairy',   label: 'Fresh dairy',   note: 'Buy within 2 days of churn — spoilage risk' },
  { id: 'pantry',  label: 'Pantry',        note: null },
  { id: 'produce', label: 'Produce',       note: null },
]

function fmt(n) {
  return n == null ? '—' : `$${Number(n).toFixed(2)}`
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PriceTracker({ order }) {
  const [prices,    setPrices]    = useState({})
  const [status,    setStatus]    = useState('idle')  // 'idle' | 'loading' | 'done' | 'error'
  const [fetchedAt, setFetchedAt] = useState(null)
  const [topError,  setTopError]  = useState(null)

  async function handleFetch() {
    setStatus('loading')
    setTopError(null)
    try {
      const results = await fetchKrogerPrices()
      setPrices(results)
      setFetchedAt(new Date())
      setStatus('done')
    } catch (err) {
      setTopError(err.message)
      setStatus('error')
    }
  }

  const isDone    = status === 'done'
  const isLoading = status === 'loading'

  // ── Dairy price alerts: any dairy item cheaper at Ralphs vs what was logged?
  // (Manual log is coming next — placeholder for now)
  const alerts = []

  return (
    <div className={styles.wrap}>

      {/* ── Store header ─────────────────────────────────────── */}
      <div className={styles.storeHeader}>
        <div className={styles.storeInfo}>
          <h2 className={styles.storeName}>Ralphs · Highland Park / 90042</h2>
          {fetchedAt && (
            <span className={styles.updatedAt}>
              Updated {formatTime(fetchedAt)}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`${styles.fetchBtn} ${isLoading ? styles.fetchBtnLoading : ''}`}
          onClick={handleFetch}
          disabled={isLoading}
        >
          {isLoading ? 'Fetching…' : isDone ? '↻ Refresh prices' : 'Fetch live prices'}
        </button>
      </div>

      {/* ── Top-level error (auth / network failures) ────────── */}
      {topError && (
        <div className={styles.errorBanner}>
          <strong>Error:</strong> {topError}
        </div>
      )}

      {/* ── Price alerts ──────────────────────────────────────── */}
      {alerts.map(alert => (
        <div key={alert.id} className={styles.alertBanner}>
          Price alert: <strong>{alert.name}</strong> is cheaper at Ralphs this week
        </div>
      ))}

      {/* ── Price table ───────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thIngredient}>Ingredient</th>
              <th className={styles.thProduct}>Product</th>
              <th className={styles.thPrice}>Regular</th>
              <th className={styles.thPrice}>Sale</th>
            </tr>
          </thead>

          {CATEGORIES.map(cat => {
            const ings = TRACKED_INGREDIENTS.filter(i => i.category === cat.id)
            return (
              <tbody key={cat.id}>
                {/* Category header row */}
                <tr className={styles.catRow}>
                  <td colSpan={4}>
                    <span className={styles.catLabel}>{cat.label}</span>
                    {cat.note && (
                      <span className={styles.catNote}> — {cat.note}</span>
                    )}
                  </td>
                </tr>

                {/* Ingredient rows */}
                {ings.map(ing => {
                  const p = prices[ing.id]
                  return (
                    <tr key={ing.id} className={styles.row}>
                      <td className={styles.tdIngredient}>
                        {ing.name}
                        {DAIRY_IDS.has(ing.id) && isDone && (
                          <span className={styles.dairyTag}>fresh</span>
                        )}
                      </td>

                      {/* Loading state */}
                      {isLoading && (
                        <td colSpan={3} className={styles.tdState}>
                          <span className={styles.loadingDots}>fetching…</span>
                        </td>
                      )}

                      {/* Idle / not yet fetched */}
                      {!isLoading && p === undefined && (
                        <td colSpan={3} className={styles.tdState}>—</td>
                      )}

                      {/* Ingredient-level error */}
                      {!isLoading && p?.error && (
                        <td colSpan={3} className={styles.tdError}>
                          {p.error}
                        </td>
                      )}

                      {/* Product found but no price data */}
                      {!isLoading && p === null && (
                        <td colSpan={3} className={styles.tdState}>
                          No price available at this store
                        </td>
                      )}

                      {/* Success */}
                      {!isLoading && p && !p.error && (
                        <>
                          <td className={styles.tdProduct}>
                            <span className={styles.productDesc}>{p.description}</span>
                            {p.size && (
                              <span className={styles.productSize}>{p.size}</span>
                            )}
                          </td>
                          <td className={styles.tdPrice}>{fmt(p.regular)}</td>
                          <td className={styles.tdSale}>
                            {p.promo != null
                              ? <span className={styles.salePrice}>{fmt(p.promo)}</span>
                              : <span className={styles.noSale}>—</span>
                            }
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            )
          })}
        </table>
      </div>

      {/* ── Idle prompt ───────────────────────────────────────── */}
      {status === 'idle' && (
        <p className={styles.idleNote}>
          Prices are pulled live from the Ralphs Kroger API.
          Hit "Fetch live prices" to load current pricing.
        </p>
      )}

      {/* ── Order-aware shopping note ─────────────────────────── */}
      {order?.pickupDate && isDone && (
        <ShoppingNote order={order} prices={prices} />
      )}

    </div>
  )
}

// ── Shopping note (shown when an order + pickup date exists) ─────────────────

function ShoppingNote({ order, prices }) {
  const pickup = new Date(order.pickupDate + 'T12:00:00')
  const dairyBuy = new Date(pickup)
  dairyBuy.setDate(dairyBuy.getDate() - 2)

  const dairyLabel = dairyBuy.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const dairyItems = TRACKED_INGREDIENTS.filter(i => DAIRY_IDS.has(i.id))
  const dairyTotal = dairyItems.reduce((sum, ing) => {
    const p = prices[ing.id]
    if (p && !p.error) {
      sum += p.promo ?? p.regular
    }
    return sum
  }, 0)

  return (
    <div className={styles.shoppingNote}>
      <h3 className={styles.shoppingNoteTitle}>
        Pre-drop dairy run · buy by {dairyLabel}
      </h3>
      <ul className={styles.shoppingList}>
        {dairyItems.map(ing => {
          const p = prices[ing.id]
          if (!p || p.error) return null
          const price = p.promo ?? p.regular
          return (
            <li key={ing.id} className={styles.shoppingItem}>
              <span className={styles.shoppingItemName}>{ing.name}</span>
              <span className={styles.shoppingItemPrice}>{fmt(price)}</span>
            </li>
          )
        })}
      </ul>
      {dairyTotal > 0 && (
        <p className={styles.shoppingTotal}>
          Estimated Ralphs dairy total: <strong>{fmt(dairyTotal)}</strong>
        </p>
      )}
    </div>
  )
}
