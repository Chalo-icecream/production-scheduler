import { FLAVOR_MAP } from '../data/flavors.js'
import { formatAmount } from '../utils/scale.js'
import { buildShoppingList, SHOPPING_GROUPS } from '../utils/shopping.js'
import { BULK_DAIRY_THRESHOLD_PINTS, BULK_DAIRY_NOTE } from '../data/flavors.js'
import styles from './ShoppingList.module.css'

export default function ShoppingList({ order }) {
  const { groups, totalKnownCost, totalPints, hasUnknownCosts } =
    buildShoppingList(order, FLAVOR_MAP)

  const showBulkBanner = totalPints >= BULK_DAIRY_THRESHOLD_PINTS

  return (
    <div className={styles.wrapper}>

      {/* ── Bulk dairy banner ────────────────────────────────────── */}
      {showBulkBanner && (
        <div className={styles.bulkBanner}>
          <span className={styles.bulkIcon}>★</span>
          {BULK_DAIRY_NOTE}
        </div>
      )}

      {/* ── Sourcing groups ──────────────────────────────────────── */}
      {groups.map(group => (
        <section key={group.id} className={styles.group}>

          <div className={styles.groupHeader}>
            <div className={styles.groupTitleRow}>
              <h3 className={styles.groupLabel}>{group.label}</h3>
              {group.sublabel && (
                <span className={styles.groupSublabel}>{group.sublabel}</span>
              )}
            </div>
            {group.warning && (
              <p className={styles.groupWarning}>
                ⚠ Buy these within 2 days of your churn date
              </p>
            )}
          </div>

          <ul className={styles.itemList}>
            {group.items.map(item => (
              <li key={`${item.name}|${item.source}`} className={styles.itemRow}>

                <div className={styles.itemLeft}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemTotal}>
                    {formatAmount(item.displayTotal, item.unit)}
                  </span>
                </div>

                <div className={styles.itemRight}>
                  {item.suggestedBuy ? (
                    <>
                      <span className={styles.buyQty}>
                        buy {item.suggestedBuy.units} × {item.suggestedBuy.unitLabel}
                      </span>
                      <span className={styles.itemCost}>
                        ${item.suggestedBuy.totalCost.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className={styles.noCost}>—</span>
                  )}
                </div>

              </li>
            ))}
          </ul>

        </section>
      ))}

      {/* ── Cost summary footer ──────────────────────────────────── */}
      <footer className={styles.costFooter}>
        <div className={styles.costRow}>
          <span className={styles.costLabel}>Estimated total</span>
          <span className={styles.costValue}>
            {totalKnownCost > 0
              ? `$${totalKnownCost.toFixed(2)}${hasUnknownCosts ? ' +' : ''}`
              : '—'
            }
          </span>
        </div>
        {hasUnknownCosts && (
          <p className={styles.costHint}>
            Partial estimate — upload receipts to price remaining items
          </p>
        )}
      </footer>

    </div>
  )
}
