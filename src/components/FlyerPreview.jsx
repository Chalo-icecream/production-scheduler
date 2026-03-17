import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import styles from './FlyerPreview.module.css'

// ── Flyer dimensions (CSS px = 1/96 in) ─────────────────────────────────────
const FLYER_W      = 816   // 8.5 in
const FLYER_H_FULL = 1056  // 11 in
const FLYER_H_HALF = 528   //  5.5 in

const HOTPLATE_URL = 'https://hotplate.com/chaloicecream'

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
    bg:          '#F5A623',
    headline:    '#1A1A1A',
    body:        '#1A1A1A',
    bodyMuted:   'rgba(26,26,26,0.65)',
    divider:     'rgba(26,26,26,0.2)',
    cardBg:      '#FFFFFF',
    cardText:    '#1A1A1A',
    cardMuted:   '#5C4E38',
    label:       'rgba(26,26,26,0.55)',
  },
  green: {
    bg:          '#2D5A3D',
    headline:    '#F5A623',
    body:        '#FFF8EE',
    bodyMuted:   'rgba(255,248,238,0.7)',
    divider:     'rgba(255,248,238,0.2)',
    cardBg:      '#FFF8EE',
    cardText:    '#1A1A1A',
    cardMuted:   '#5C4E38',
    label:       'rgba(255,248,238,0.55)',
  },
  black: {
    bg:          '#1A1A1A',
    headline:    '#F5A623',
    body:        '#FFF8EE',
    bodyMuted:   'rgba(255,248,238,0.65)',
    divider:     'rgba(255,248,238,0.15)',
    cardBg:      '#FFF8EE',
    cardText:    '#1A1A1A',
    cardMuted:   '#5C4E38',
    label:       'rgba(255,248,238,0.45)',
  },
  cream: {
    bg:          '#FFF8EE',
    headline:    '#1A1A1A',
    body:        '#1A1A1A',
    bodyMuted:   'rgba(26,26,26,0.6)',
    divider:     'rgba(26,26,26,0.12)',
    cardBg:      '#FFFFFF',
    cardText:    '#1A1A1A',
    cardMuted:   '#5C4E38',
    label:       'rgba(26,26,26,0.45)',
  },
}

const TAGLINES = {
  highland_park: 'Homemade in Highland Park by someone who should probably get out more',
  eagle_rock:    'Small batch Indian ice cream, made just down the road',
  mt_washington: 'Your neighbor makes Indian ice cream. You should try it.',
  silver_lake:   'Indian ice cream. Not fusion. Not weird. Just good.',
  pasadena:      'Handmade Indian ice cream. Pickup in Highland Park.',
  glendale:      'Ice cream inspired by Kerala, Goa, Calcutta & Shimla.',
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

  const flyerH      = form.size === 'half' ? FLYER_H_HALF : FLYER_H_FULL
  const variantKey  = NEIGHBORHOOD_VARIANT[form.neighborhood] ?? 'warm'
  const c           = VARIANTS[variantKey]
  const tagline     = TAGLINES[form.neighborhood] ?? ''
  const activeFlavors = flavors.filter(f => form.flavors[f.id])

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
      width: 160, margin: 1,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
    })
  }, [])

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
          className={styles.flyer}
          style={{ background: c.bg, width: FLYER_W, height: flyerH }}
        >

          {/* ── Hero ──────────────────────────────────────────────── */}
          <section className={styles.hero}>
            <h1 className={styles.brand} style={{ color: c.headline }}>
              CHALO
            </h1>
            <p className={styles.tagline} style={{ color: c.bodyMuted }}>
              {tagline}
            </p>
            <div className={styles.divider} style={{ background: c.divider }} />
            <p className={styles.categoryLabel} style={{ color: c.label }}>
              Small batch Indian ice cream
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
                    <strong className={styles.flavorLead}>{f.lead}</strong>
                    {' '}
                    <span className={styles.flavorRest}>{f.rest}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Order card ────────────────────────────────────────── */}
          <section className={styles.orderCard} style={{ background: c.cardBg }}>
            <p className={styles.orderLabel} style={{ color: c.cardMuted }}>
              Order on Hotplate
            </p>
            <canvas ref={canvasRef} className={styles.qrCanvas} />
            <p className={styles.orderUrl} style={{ color: c.cardText }}>
              hotplate.com/chaloicecream
            </p>
            <div className={styles.orderMeta} style={{ color: c.cardMuted }}>
              {form.dropDate && (
                <span>Drop: {formatDropDate(form.dropDate)}</span>
              )}
              {form.location && (
                <span>Pickup: {form.location}</span>
              )}
            </div>
            {form.discountCode && (
              <p className={styles.discountCode} style={{ color: c.cardText }}>
                Use code <strong>{form.discountCode.toUpperCase()}</strong> for 10% off
              </p>
            )}
          </section>

        </div>
        {/* ── /THE FLYER ────────────────────────────────────────────────── */}

      </div>
    </div>
  )
}
