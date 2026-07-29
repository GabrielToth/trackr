import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { lookupGeo } from '@/lib/geo'
import { parseUA } from '@/lib/ua'
import { TrackingScript } from './tracking-script'

interface Props {
  params: Promise<{ code: string }>
}

export default async function RedirectPage({ params }: Props) {
  const { code } = await params

  const link = await prisma.link.findUnique({ where: { code } })
  if (!link) {
    redirect('/')
  }

  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = headersList.get('user-agent') || ''
  const referrer = headersList.get('referer') || ''
  const language = headersList.get('accept-language') || ''

  const [geo, ua] = await Promise.all([
    lookupGeo(ip),
    Promise.resolve(parseUA(userAgent)),
  ])

  const utmSource = link.utmSource
  const utmMedium = link.utmMedium
  const utmCampaign = link.utmCampaign
  const utmTerm = link.utmTerm
  const utmContent = link.utmContent

  const click = await prisma.click.create({
    data: {
      linkId: link.id,
      code: link.code,
      ip,
      userAgent,
      browser: ua.browser,
      browserVersion: ua.browserVersion,
      os: ua.os,
      osVersion: ua.osVersion,
      device: ua.device,
      deviceModel: ua.deviceModel,
      referrer,
      language,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timezone: geo.timezone,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return (
    <html>
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, background: '#000' }}>
        <TrackingScript
          clickId={click.id}
          trackUrl={`${baseUrl}/api/track/${code}`}
          destination={link.url}
        />
      </body>
    </html>
  )
}
