// Vercel serverless function — server-side proxy for the Kroger API.
// Keeps credentials off the client and sidesteps CORS restrictions.
//
// Supported query params:
//   ?action=location            → returns the nearest Ralphs locationId near 90042
//   ?action=search&term=<str>   → searches Kroger product catalog, returns raw API response
//
// Env vars required (set in Vercel project settings):
//   VITE_KROGER_CLIENT_ID
//   VITE_KROGER_CLIENT_SECRET

const BASE = 'https://api.kroger.com/v1'

// ── Module-level cache (persists across warm Lambda invocations) ─────────────
let _token       = null
let _tokenExpiry = 0
let _locationId  = null

async function getToken() {
  if (_token && Date.now() < _tokenExpiry - 60_000) return _token

  const id     = process.env.VITE_KROGER_CLIENT_ID
  const secret = process.env.VITE_KROGER_CLIENT_SECRET

  if (!id || !secret) {
    throw new Error('VITE_KROGER_CLIENT_ID / VITE_KROGER_CLIENT_SECRET not set')
  }

  const creds = Buffer.from(`${id}:${secret}`).toString('base64')
  const res   = await fetch(`${BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${creds}`,
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OAuth token failed (${res.status}): ${text}`)
  }

  const data   = await res.json()
  _token       = data.access_token
  _tokenExpiry = Date.now() + data.expires_in * 1000
  return _token
}

async function getLocationId() {
  if (_locationId) return _locationId

  const token = await getToken()
  const url   = `${BASE}/locations?filter.zipCode=90042&filter.radiusInMiles=5&filter.chain=RALPHS&filter.limit=1`
  const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Location lookup failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  if (!data.data?.length) throw new Error('No Ralphs found within 5 miles of 90042')

  _locationId = data.data[0].locationId
  return _locationId
}

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Allow cross-origin from the Vite dev server during local development
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action, term } = req.query

  try {
    if (action === 'location') {
      const locationId = await getLocationId()
      return res.status(200).json({ locationId })
    }

    if (action === 'search') {
      if (!term) return res.status(400).json({ error: 'term is required' })

      const [token, locationId] = await Promise.all([getToken(), getLocationId()])

      const params = new URLSearchParams({
        'filter.term':       term,
        'filter.locationId': locationId,
        'filter.limit':      '5',
      })

      const upstream = await fetch(`${BASE}/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!upstream.ok) {
        const text = await upstream.text()
        return res.status(upstream.status).json({ error: `Kroger API (${upstream.status}): ${text}` })
      }

      return res.status(200).json(await upstream.json())
    }

    return res.status(400).json({ error: `Unknown action "${action}"` })
  } catch (err) {
    console.error('[api/kroger]', err)
    return res.status(500).json({ error: err.message })
  }
}
