import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const AUTH_COOKIE = 'trackr_session'
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'

function sign(payload: string): string {
  const hmac = createHmac('sha256', AUTH_SECRET)
  hmac.update(payload)
  return `${payload}.${hmac.digest('hex')}`
}

function verify(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const payload = parts[0]
  const signature = parts[1]
  const expected = createHmac('sha256', AUTH_SECRET)
  expected.update(payload)
  if (signature === expected.digest('hex')) {
    return payload
  }
  return null
}

export function createSessionToken(email: string): string {
  const data = JSON.stringify({ email, exp: Date.now() + 86400000 })
  return sign(data)
}

export function parseSessionToken(token: string): { email: string } | null {
  const data = verify(token)
  if (!data) return null
  try {
    const parsed = JSON.parse(data)
    if (parsed.exp < Date.now()) return null
    if (parsed.email !== ADMIN_EMAIL) return null
    return { email: parsed.email }
  } catch {
    return null
  }
}

export function isValidCredentials(email: string, password: string): boolean {
  return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD
}

export async function setAuthCookie(email: string) {
  const cookieStore = await cookies()
  const token = createSessionToken(email)
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
}

export async function getAuthSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  if (!token) return null
  return parseSessionToken(token)
}

export function redirectToLogin(path: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: `/login?redirect=${encodeURIComponent(path)}` },
  })
}
