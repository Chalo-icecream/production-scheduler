import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import styles from './FlyerPreview.module.css'

// ── Flyer dimensions (CSS px = 1/96 in) ─────────────────────────────────────
const FLYER_W      = 816   // 8.5 in
const FLYER_H_FULL = 1056  // 11 in
const FLYER_H_HALF = 528   //  5.5 in

const HOTPLATE_URL = 'https://hotplate.com/chaloicecream'
const TAGLINE      = 'Homemade in Highland Park by someone who should probably get out more.'

// ── Design variants keyed by neighborhood value ──────────────────────────────
const NEIGHBORHOOD_VARIANT = {
  highland_park: 'warm',
  eagle_rock:    'warm',
  glendale:      'warm',
  mt_washington: 'green',
  silver_lake:   'black',
  pasadena:      'cream',
}

export const VARIANTS = {
  warm: {
    bg:       '#F5A623',
    headline: '#1A1A1A',
    body:     '#1A1A1A',
    bodyMuted:'rgba(26,26,26,0.65)',
  },
  green: {
    bg:       '#2D5A3D',
    headline: '#F5A623',
    body:     '#FFF8EE',
    bodyMuted:'rgba(255,248,238,0.7)',
  },
  black: {
    bg:       '#1A1A1A',
    headline: '#F5A623',
    body:     '#FFF8EE',
    bodyMuted:'rgba(255,248,238,0.65)',
  },
  cream: {
    bg:       '#FFF8EE',
    headline: '#1A1A1A',
    body:     '#1A1A1A',
    bodyMuted:'rgba(26,26,26,0.6)',
  },
}

function formatDropDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d, 12).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric',
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FlyerPreview({ form, flavors }) {
  const wrapperRef  = useRef(null)
  const canvasRef   = useRef(null)
  const [scale, setScale] = useState(0.5)

  const isHalf        = form.size === 'half'
  const flyerH        = isHalf ? FLYER_H_HALF : FLYER_H_FULL
  const variantKey    = NEIGHBORHOOD_VARIANT[form.neighborhood] ?? 'warm'
  const c             = VARIANTS[variantKey]
  const activeFlavors = flavors.filter(f => form.flavors[f.id])
  const qrSize        = isHalf ? 88 : 120

  // ── Scale to fit available width ──────────────────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / FLYER_W)
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── QR code ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, HOTPLATE_URL, {
      width: qrSize, margin: 1,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
    })
  }, [qrSize])

  return (
    // Wrapper: measured for scale, height collapses to match scaled flyer
    <div
      ref={wrapperRef}
      className={styles.scaleWrapper}
      style={{ height: flyerH * scale }}
    >
      {/* Scale container */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: FLYER_W }}>

        {/* ── THE FLYER ─────────────────────────────────────────────────── */}
        <div
          data-flyer=""
          className={`${styles.flyer}${isHalf ? ` ${styles.halfPage}` : ''}`}
          style={{ background: c.bg, width: FLYER_W, height: flyerH }}
        >

          {/* ── Hero ──────────────────────────────────────────────── */}
          <section className={styles.hero}>
            <h1 className={styles.brand} style={{ color: c.headline }}>
              CHALO
            </h1>
            <p className={styles.tagline} style={{ color: c.bodyMuted }}>
              {TAGLINE}
            </p>
          </section>

          {/* ── Flavors ───────────────────────────────────────────── */}
          <section className={styles.flavors}>
            {activeFlavors.length === 0 ? (
              <p className={styles.noFlavors} style={{ color: c.bodyMuted }}>
                Select at least one flavor
              </p>
            ) : (
              <ul className={styles.flavorList}>
                {activeFlavors.map(f => (
                  <li key={f.id} className={styles.flavorLine} style={{ color: c.body }}>
                    <strong className={styles.flavorName}>{f.name}</strong>
                    {' — '}
                    <span className={styles.flavorIngredients}>{f.ingredients}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Bottom row ────────────────────────────────────────── */}
          <div className={styles.bottomRow}>
            <div className={styles.bottomMeta}>
              {form.dropDate && (
                <p className={styles.metaLine} style={{ color: c.body }}>
                  Drop: {formatDropDate(form.dropDate)}
                </p>
              )}
              {form.location && (
                <p className={styles.metaLine} style={{ color: c.body }}>
                  Pickup: {form.location}
                </p>
              )}
              {form.discountCode && (
                <p className={styles.discountCode} style={{ color: c.bodyMuted }}>
                  Use code <strong>{form.discountCode.toUpperCase()}</strong> for 10% off
                </p>
              )}
            </div>
            <div className={styles.qrCard}>
              <canvas ref={canvasRef} className={styles.qrCanvas} />
              <p className={styles.qrUrl}>hotplate.com/chaloicecream</p>
            </div>
          </div>

        </div>
        {/* ── /THE FLYER ────────────────────────────────────────────────── */}

      </div>
    </div>
  )
}
