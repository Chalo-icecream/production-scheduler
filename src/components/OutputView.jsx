import { useState } from 'react'
import YieldCalculator from './YieldCalculator.jsx'
import ShoppingList from './ShoppingList.jsx'
import Schedule from './Schedule.jsx'
import Manifest from './Manifest.jsx'
import styles from './OutputView.module.css'

const TABS = [
  { id: 'yield',    label: 'Yield'          },
  { id: 'shopping', label: 'Shopping List'  },
  { id: 'schedule', label: 'Schedule'       },
  { id: 'manifest', label: 'Manifest'       },
]

export default function OutputView({ order, onBack }) {
  const [activeTab, setActiveTab] = useState('yield')
  const isPractice = order.mode === 'practice'

  return (
    <div className={styles.wrapper}>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} type="button" onClick={onBack}>
          ← Back to order
        </button>
        <span className={styles.modeBadge}>
          {isPractice ? 'Practice round' : 'Drop planning'}
        </span>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────── */}
      <div className={styles.tabBar} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Active panel ──────────────────────────────────────────── */}
      <div className={styles.panel}>
        {activeTab === 'yield'    && <YieldCalculator order={order} />}
        {activeTab === 'shopping' && <ShoppingList    order={order} />}
        {activeTab === 'schedule' && <Schedule order={order} />}
        {activeTab === 'manifest' && <Manifest order={order} />}
      </div>

    </div>
  )
}

