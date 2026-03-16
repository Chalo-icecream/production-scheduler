import { FLAVOR_MAP } from '../data/flavors.js'
import { BULK_DAIRY_THRESHOLD_PINTS, BULK_DAIRY_NOTE } from '../data/flavors.js'
import { buildSchedule } from '../utils/schedule.js'
import styles from './Schedule.module.css'

export default function Schedule({ order }) {
  const isPractice = order.mode === 'practice'

  if (isPractice || !order.pickupDate) {
    return (
      <div className={styles.practiceMsg}>
        <p className={styles.practiceMsgTitle}>No pickup date set</p>
        <p className={styles.practiceMsgSub}>
          Switch to Drop planning and enter a pickup date to see the production schedule.
        </p>
      </div>
    )
  }

  const schedule = buildSchedule(order, FLAVOR_MAP)
  if (!schedule) return null

  const { makeAheadItems, freshDairyDateLabel, pickupDateLabel, days, totalPints } = schedule

  return (
    <div className={styles.wrap}>

      {/* ── Make-ahead banner ──────────────────────────────────────── */}
      {makeAheadItems.length > 0 && (
        <div className={styles.makeAheadBanner}>
          <h3 className={styles.bannerHeading}>Make-ahead — complete before production week</h3>
          <ul className={styles.makeAheadList}>
            {makeAheadItems.flatMap(({ flavorName, components }) =>
              components.map(comp => (
                <li key={comp.id} className={styles.makeAheadItem}>
                  <span className={styles.makeAheadFlavor}>{flavorName}</span>
                  <span className={styles.makeAheadName}>{comp.name}</span>
                  <span className={styles.makeAheadKeeps}>Keeps {comp.keeps}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* ── Fresh dairy reminder ───────────────────────────────────── */}
      <div className={styles.freshDairyBanner}>
        <div className={styles.freshDairyMain}>
          Buy fresh dairy by <strong>{freshDairyDateLabel}</strong>
          <span className={styles.freshDairySub}> — 2 days before pickup</span>
        </div>
        {totalPints >= BULK_DAIRY_THRESHOLD_PINTS && (
          <p className={styles.bulkNote}>{BULK_DAIRY_NOTE}</p>
        )}
      </div>

      {/* ── Day cards ─────────────────────────────────────────────── */}
      <div className={styles.dayCards}>
        {days.map(day => (
          <DayCard key={day.offset} day={day} multiFlavorOrder={order.flavors.length > 1} />
        ))}
      </div>

      {/* ── Pickup note ───────────────────────────────────────────── */}
      <div className={styles.pickupNote}>
        Pickup: <strong>{pickupDateLabel}</strong>
      </div>

    </div>
  )
}

function DayCard({ day, multiFlavorOrder }) {
  return (
    <div className={`${styles.dayCard} ${day.isChurnDay ? styles.churnDay : ''}`}>

      {/* Card header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardDate}>{day.dateLabel}</div>
          <div className={styles.cardLabel}>{day.daysBeforeLabel}</div>
        </div>
        <div className={styles.cardTotalTime}>
          {day.totalActiveMin} min active
        </div>
      </div>

      {/* Flavor groups */}
      <div className={styles.cardBody}>
        {day.flavorGroups.map(group => (
          <div key={group.flavorId} className={styles.flavorGroup}>
            {multiFlavorOrder && (
              <div className={styles.flavorGroupLabel}>{group.flavorName}</div>
            )}
            <ul className={styles.taskList}>
              {group.tasks.map(task => (
                <li
                  key={task.componentId}
                  className={`${styles.taskRow} ${task.isChurn ? styles.churnTask : ''}`}
                >
                  <span className={styles.taskName}>{task.componentName}</span>
                  <span className={styles.taskTime}>{task.activeMin} min</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  )
}
