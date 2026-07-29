import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { lookupGeo } from '@/lib/geo'
import { parseUA } from '@/lib/ua'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()

    const link = await prisma.link.findUnique({ where: { code } })
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1'
    const [geo, ua] = await Promise.all([
      lookupGeo(ip),
      Promise.resolve(parseUA(request.headers.get('user-agent') || '')),
    ])

    await prisma.click.update({
      where: { id: body.clickId },
      data: {
        screenWidth: body.screenWidth ?? null,
        screenHeight: body.screenHeight ?? null,
        colorDepth: body.colorDepth ?? null,
        pixelRatio: body.pixelRatio ?? null,
        timezoneOffset: body.timezoneOffset ?? null,
        platform: body.platform ?? null,
        cookiesEnabled: body.cookiesEnabled ?? null,
        doNotTrack: body.doNotTrack ?? null,
        connectionType: body.connectionType ?? null,
        connectionDownlink: body.connectionDownlink ?? null,
        connectionRtt: body.connectionRtt ?? null,
        touchSupport: body.touchSupport ?? null,
        fingerprintId: body.fingerprintId ?? null,
        canvasFingerprint: body.canvasFingerprint ?? null,
        webglVendor: body.webglVendor ?? null,
        webglRenderer: body.webglRenderer ?? null,
        canvasFonts: body.canvasFonts ?? null,
        redirectDelay: body.redirectDelay ?? null,
        bounced: body.bounced ?? false,

        ip,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        timezone: geo.timezone,
        browser: ua.browser,
        browserVersion: ua.browserVersion,
        os: ua.os,
        osVersion: ua.osVersion,
        device: ua.device,
        deviceModel: ua.deviceModel,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Track error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
