import { useState } from 'react'
import FlyerPreview from './FlyerPreview.jsx'
import styles from './FlyerGenerator.module.css'

// ── Static data ───────────────────────────────────────────────────────────────

const NEIGHBORHOODS = [
  { value: 'highland_park', label: 'Highland Park'              },
  { value: 'eagle_rock',    label: 'Eagle Rock'                 },
  { value: 'mt_washington', label: 'Mt Washington'              },
  { value: 'silver_lake',   label: 'Silver Lake'                },
  { value: 'pasadena',      label: 'Pasadena / South Pasadena'  },
  { value: 'glendale',      label: 'Glendale / La Crescenta'    },
]

export const FLYER_FLAVORS = [
  { id: 'kerala',   name: 'Kerala',   lead: 'Curry leaf.',    rest: 'Pineapple. Ginger.'                             },
  { id: 'goa',      name: 'Goa',      lead: 'Passionfruit.',  rest: 'Jalebi. Coconut.'                              },
  { id: 'calcutta', name: 'Calcutta', lead: 'Chai.',          rest: 'Honey Milk Jam. Brown Butter Tahini Fudge.'    },
  { id: 'shimla',   name: 'Shimla',   lead: 'Honeydew.',      rest: 'Genmaicha. Cucumber Jalapeño.'                 },
]

function todayISO() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FlyerGenerator() {
  const [form, setForm] = useState({
    dropDate:     todayISO(),
    location:     'Highland Park',
    discountCode: 'FLYER',
    neighborhood: 'highland_park',
    size:         'full',
    flavors:      { kerala: true, goa: true, calcutta: true, shimla: true },
  })

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function setFlavor(id, checked) {
    setForm(prev => ({ ...prev, flavors: { ...prev.flavors, [id]: checked } }))
  }

  return (
    <div className={styles.layout}>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <div className={styles.formPanel}>
        <h2 className={styles.formTitle}>Flyer settings</h2>

        {/* Drop date */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="drop-date">Drop date</label>
          <input
            id="drop-date"
            type="date"
            className={styles.input}
            value={form.dropDate}
            onChange={e => set('dropDate', e.target.value)}
          />
        </div>

        {/* Pickup location */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="location">Pickup location</label>
          <input
            id="location"
            type="text"
            className={styles.input}
            value={form.location}
            onChange={e => set('location', e.target.value)}
          />
        </div>

        {/* Discount code */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="discount">Discount code</label>
          <input
            id="discount"
            type="text"
            className={styles.input}
            value={form.discountCode}
            onChange={e => set('discountCode', e.target.value)}
          />
        </div>

        {/* Neighborhood → determines variant + tagline */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="neighborhood">Neighborhood</label>
          <select
            id="neighborhood"
            className={styles.select}
            value={form.neighborhood}
            onChange={e => set('neighborhood', e.target.value)}
          >
            {NEIGHBORHOODS.map(n => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        {/* Size toggle */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Size</span>
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${form.size === 'full' ? styles.toggleActive : ''}`}
              onClick={() => set('size', 'full')}
            >
              Full page
              <span className={styles.toggleSub}>8.5 × 11</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${form.size === 'half' ? styles.toggleActive : ''}`}
              onClick={() => set('size', 'half')}
            >
              Half page
              <span className={styles.toggleSub}>8.5 × 5.5</span>
            </button>
          </div>
        </div>

        {/* Flavor checkboxes */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Flavors</span>
          <div className={styles.checkboxGroup}>
            {FLYER_FLAVORS.map(f => (
              <label key={f.id} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={form.flavors[f.id]}
                  onChange={e => setFlavor(f.id, e.target.checked)}
                />
                <span className={styles.checkboxLabel}>{f.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Print button */}
        <button
          type="button"
          className={styles.printBtn}
          onClick={() => window.print()}
        >
          Print flyer
        </button>
      </div>

      {/* ── Preview panel ───────────────────────────────────────── */}
      <div className={styles.previewPanel}>
        <div className={styles.previewHeading}>
          <span className={styles.previewLabel}>Live preview</span>
          <span className={styles.previewSize}>
            {form.size === 'full' ? '8.5 × 11 in' : '8.5 × 5.5 in'}
          </span>
        </div>
        <FlyerPreview form={form} flavors={FLYER_FLAVORS} />
      </div>

    </div>
  )
}
