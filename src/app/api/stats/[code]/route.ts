import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const link = await prisma.link.findUnique({ where: { code } })
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const totalClicks = await prisma.click.count({ where: { linkId: link.id } })

    const clicksOverTime = await prisma.click.findMany({
      where: { linkId: link.id },
      select: { clickedAt: true },
      orderBy: { clickedAt: 'asc' },
    })

    const clicksByDate = clicksOverTime.reduce<Record<string, number>>((acc, c) => {
      const date = c.clickedAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const clicksByCountry = await prisma.click.groupBy({
      by: ['country'],
      where: { linkId: link.id, country: { not: null } },
      _count: true,
      orderBy: { _count: { country: 'desc' } },
    })

    const clicksByDevice = await prisma.click.groupBy({
      by: ['device'],
      where: { linkId: link.id, device: { not: null } },
      _count: true,
    })

    const clicksByBrowser = await prisma.click.groupBy({
      by: ['browser'],
      where: { linkId: link.id, browser: { not: null } },
      _count: true,
      orderBy: { _count: { browser: 'desc' } },
    })

    const clicksByOs = await prisma.click.groupBy({
      by: ['os'],
      where: { linkId: link.id, os: { not: null } },
      _count: true,
      orderBy: { _count: { os: 'desc' } },
    })

    const clicksByReferrer = await prisma.click.groupBy({
      by: ['referrer'],
      where: { linkId: link.id, referrer: { not: null } },
      _count: true,
      orderBy: { _count: { referrer: 'desc' } },
      take: 10,
    })

    const clicksByUtmSource = await prisma.click.groupBy({
      by: ['utmSource'],
      where: { linkId: link.id, utmSource: { not: null } },
      _count: true,
      orderBy: { _count: { utmSource: 'desc' } },
    })

    const bounceRate = totalClicks > 0
      ? (await prisma.click.count({ where: { linkId: link.id, bounced: true } })) / totalClicks
      : 0

    const lastClicks = await prisma.click.findMany({
      where: { linkId: link.id },
      orderBy: { clickedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        clickedAt: true,
        country: true,
        city: true,
        browser: true,
        os: true,
        device: true,
        referrer: true,
        utmSource: true,
        screenWidth: true,
        screenHeight: true,
        language: true,
        bounced: true,
      },
    })

    return NextResponse.json({
      link,
      stats: {
        totalClicks,
        clicksByDate,
        clicksByCountry,
        clicksByDevice,
        clicksByBrowser,
        clicksByOs,
        clicksByReferrer,
        clicksByUtmSource,
        bounceRate: Math.round(bounceRate * 100),
        lastClicks,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
