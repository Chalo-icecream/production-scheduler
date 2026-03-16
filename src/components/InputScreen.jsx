import { useState } from 'react'
import { FLAVORS } from '../data/flavors.js'
import styles from './InputScreen.module.css'

const DEFAULT_PINTS = Object.fromEntries(FLAVORS.map((f) => [f.id, '']))

export default function InputScreen({ onSubmit }) {
  const [mode, setMode] = useState('drop')        // 'practice' | 'drop'
  const [pints, setPints] = useState(DEFAULT_PINTS)
  const [pickupDate, setPickupDate] = useState('')
  const [errors, setErrors] = useState({})

  // In practice mode, each selected flavor is locked to 2 pints.
  // We just track which flavors are selected.
  const [practiceSelected, setPracticeSelected] = useState(
    Object.fromEntries(FLAVORS.map((f) => [f.id, false]))
  )

  function handleModeSwitch(next) {
    setMode(next)
    setErrors({})
  }

  function handlePintsChange(flavorId, raw) {
    const val = raw.replace(/[^0-9]/g, '')
    setPints((prev) => ({ ...prev, [flavorId]: val }))
    if (errors[flavorId]) setErrors((prev) => ({ ...prev, [flavorId]: null }))
  }

  function handlePracticeToggle(flavorId) {
    setPracticeSelected((prev) => ({ ...prev, [flavorId]: !prev[flavorId] }))
  }

  function validate() {
    const errs = {}
    if (mode === 'drop') {
      const totalPints = FLAVORS.reduce((sum, f) => {
        return sum + (parseInt(pints[f.id], 10) || 0)
      }, 0)
      if (totalPints === 0) {
        errs._global = 'Enter at least one pint count.'
      }
      FLAVORS.forEach((f) => {
        const n = parseInt(pints[f.id], 10)
        if (pints[f.id] !== '' && (isNaN(n) || n < 0)) {
          errs[f.id] = 'Must be 0 or more'
        }
      })
      if (!pickupDate) {
        errs.pickupDate = 'Pickup date is required for drop planning.'
      }
    } else {
      const anySelected = FLAVORS.some((f) => practiceSelected[f.id])
      if (!anySelected) errs._global = 'Select at least one flavor.'
    }
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const flavorOrders =
      mode === 'drop'
        ? FLAVORS.filter((f) => parseInt(pints[f.id], 10) > 0).map((f) => ({
            flavorId: f.id,
            pints: parseInt(pints[f.id], 10),
          }))
        : FLAVORS.filter((f) => practiceSelected[f.id]).map((f) => ({
            flavorId: f.id,
            pints: 2,
          }))

    onSubmit({
      mode,
      flavors: flavorOrders,
      pickupDate: mode === 'drop' ? pickupDate : null,
    })
  }

  const isPractice = mode === 'practice'

  // Today's date string for the date input min
  const today = new Date().toISOString().split('T')[0]

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      {/* ── Mode toggle ───────────────────────────────────────────── */}
      <fieldset className={styles.modeFieldset}>
        <legend className={styles.sectionLabel}>Mode</legend>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${!isPractice ? styles.modeBtnActive : ''}`}
            onClick={() => handleModeSwitch('drop')}
          >
            Drop planning
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${isPractice ? styles.modeBtnActive : ''}`}
            onClick={() => handleModeSwitch('practice')}
          >
            Practice round
          </button>
        </div>
        {isPractice && (
          <p className={styles.modeHint}>
            Locks to 2 pints per flavor. No pickup date needed.
          </p>
        )}
      </fieldset>

      {/* ── Pints per flavor ──────────────────────────────────────── */}
      <fieldset className={styles.flavorsFieldset}>
        <legend className={styles.sectionLabel}>
          {isPractice ? 'Select flavors' : 'Pints per flavor'}
        </legend>

        <div className={styles.flavorList}>
          {FLAVORS.map((flavor) => (
            <div key={flavor.id} className={styles.flavorRow}>
              <div className={styles.flavorMeta}>
                <span className={styles.flavorName}>{flavor.name}</span>
                <span className={styles.flavorDescriptor}>{flavor.descriptor}</span>
              </div>

              {isPractice ? (
                <button
                  type="button"
                  className={`${styles.practiceToggle} ${
                    practiceSelected[flavor.id] ? styles.practiceToggleOn : ''
                  }`}
                  onClick={() => handlePracticeToggle(flavor.id)}
                  aria-pressed={practiceSelected[flavor.id]}
                >
                  {practiceSelected[flavor.id] ? '2 pints ✓' : 'Include'}
                </button>
              ) : (
                <div className={styles.pintsInputWrap}>
                  <input
                    id={`pints-${flavor.id}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    placeholder="—"
                    value={pints[flavor.id]}
                    onChange={(e) => handlePintsChange(flavor.id, e.target.value)}
                    className={`${styles.pintsInput} ${
                      errors[flavor.id] ? styles.pintsInputError : ''
                    }`}
                    aria-label={`${flavor.name} pints`}
                  />
                  <span className={styles.pintsUnit}>pints</span>
                  {errors[flavor.id] && (
                    <span className={styles.fieldError}>{errors[flavor.id]}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </fieldset>

      {/* ── Pickup date (drop mode only) ──────────────────────────── */}
      {!isPractice && (
        <fieldset className={styles.dateFieldset}>
          <legend className={styles.sectionLabel}>Pickup date</legend>
          <div className={styles.dateRow}>
            <input
              type="date"
              id="pickup-date"
              value={pickupDate}
              min={today}
              onChange={(e) => {
                setPickupDate(e.target.value)
                if (errors.pickupDate)
                  setErrors((prev) => ({ ...prev, pickupDate: null }))
              }}
              className={`${styles.dateInput} ${
                errors.pickupDate ? styles.dateInputError : ''
              }`}
            />
            {errors.pickupDate && (
              <span className={styles.fieldError}>{errors.pickupDate}</span>
            )}
          </div>
        </fieldset>
      )}

      {/* ── Global error ──────────────────────────────────────────── */}
      {errors._global && (
        <p className={styles.globalError} role="alert">
          {errors._global}
        </p>
      )}

      {/* ── Submit ────────────────────────────────────────────────── */}
      <button type="submit" className={styles.submitBtn}>
        {isPractice ? 'Build practice schedule' : 'Plan this drop →'}
      </button>
    </form>
  )
}
