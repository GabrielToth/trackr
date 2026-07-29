export interface GeoResult {
  country: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  isp: string | null
}

const cache = new Map<string, Promise<GeoResult>>()

export function lookupGeo(ip: string): Promise<GeoResult> {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return Promise.resolve({
      country: 'Local',
      region: null,
      city: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: null,
    })
  }

  const cached = cache.get(ip)
  if (cached) return cached

  const promise = fetchGeoIP(ip)
  cache.set(ip, promise)
  return promise
}

async function fetchGeoIP(ip: string): Promise<GeoResult> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,timezone,isp,query`)
    const data = await res.json()

    if (data.status !== 'success') {
      return { country: null, region: null, city: null, latitude: null, longitude: null, timezone: null, isp: null }
    }

    return {
      country: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
      latitude: data.lat ?? null,
      longitude: data.lon ?? null,
      timezone: data.timezone || null,
      isp: data.isp || null,
    }
  } catch {
    return { country: null, region: null, city: null, latitude: null, longitude: null, timezone: null, isp: null }
  }
}
