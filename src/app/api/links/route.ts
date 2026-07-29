import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/code'

export async function POST(request: NextRequest) {
  try {
    const { url, title, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    let code = generateCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.link.findUnique({ where: { code } })
      if (!existing) break
      code = generateCode()
      attempts++
    }

    const link = await prisma.link.create({
      data: {
        code,
        url,
        title: title || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    return NextResponse.json({
      ...link,
      shortUrl: `${baseUrl}/${code}`,
    })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { clicks: true } },
      },
    })

    const result = await Promise.all(
      links.map(async (link) => {
        const last24h = await prisma.click.count({
          where: {
            linkId: link.id,
            clickedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        })
        const uniqueCountries = await prisma.click.groupBy({
          by: ['country'],
          where: { linkId: link.id, country: { not: null } },
        })

        return {
          ...link,
          clicks: link._count.clicks,
          clicksLast24h: last24h,
          uniqueCountries: uniqueCountries.length,
        }
      })
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
