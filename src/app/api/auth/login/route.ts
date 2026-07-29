import { NextRequest, NextResponse } from 'next/server'
import { isValidCredentials, createSessionToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (!isValidCredentials(email, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = createSessionToken(email)
    const res = NextResponse.json({ ok: true })
    res.cookies.set('trackr_session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    })

    return res
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
