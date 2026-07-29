'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { use } from 'react'

interface Click {
  id: string
  clickedAt: string
  country: string | null
  city: string | null
  browser: string | null
  os: string | null
  device: string | null
  referrer: string | null
  utmSource: string | null
  screenWidth: number | null
  screenHeight: number | null
  language: string | null
  bounced: boolean
}

interface Stats {
  totalClicks: number
  clicksByDate: Record<string, number>
  clicksByCountry: { country: string; _count: number }[]
  clicksByDevice: { device: string; _count: number }[]
  clicksByBrowser: { browser: string; _count: number }[]
  clicksByOs: { os: string; _count: number }[]
  clicksByReferrer: { referrer: string; _count: number }[]
  clicksByUtmSource: { utmSource: string; _count: number }[]
  bounceRate: number
  lastClicks: Click[]
}

interface LinkData {
  id: string
  code: string
  url: string
  title: string | null
  createdAt: string
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
    </div>
  )
}

function BarChart({ data, labelKey, valueKey, color }: {
  data: any[]
  labelKey: string
  valueKey: string
  color: string
}) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className="space-y-1.5">
      {data.slice(0, 10).map((d) => (
        <div key={d[labelKey] || 'unknown'} className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 w-24 truncate text-right shrink-0">
            {d[labelKey] || 'unknown'}
          </span>
          <div className="flex-1 bg-zinc-800 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all`}
              style={{ width: `${(d[valueKey] / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 font-mono w-8 text-left shrink-0">
            {d[valueKey]}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function LinkStatsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [link, setLink] = useState<LinkData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stats/${code}`)
      .then((res) => res.json())
      .then((data) => {
        setLink(data.link)
        setStats(data.stats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!link || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-500">Link not found</div>
      </div>
    )
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-emerald-400">Trackr</Link>
            <span className="text-sm text-zinc-500">/</span>
            <Link href="/stats" className="text-sm text-zinc-300 hover:text-zinc-100">Dashboard</Link>
            <span className="text-sm text-zinc-500">/</span>
            <span className="text-sm text-zinc-400">{code}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">{link.title || 'Untitled'}</h1>
          <p className="text-zinc-400 text-sm truncate">{link.url}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-emerald-400">{baseUrl}/{code}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${baseUrl}/${code}`)
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Clicks" value={stats.totalClicks} />
          <StatCard label="Bounce Rate" value={`${stats.bounceRate}%`} />
          <StatCard label="Countries" value={stats.clicksByCountry.length} />
          <StatCard label="Devices" value={stats.clicksByDevice.length} />
        </div>

        {stats.totalClicks === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            No clicks recorded yet. Share your link and come back!
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-4">Clicks Over Time</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-end gap-1 h-32">
                  {Object.entries(stats.clicksByDate).slice(-30).map(([date, count]) => {
                    const maxVal = Math.max(...Object.values(stats.clicksByDate), 1)
                    const height = (count / maxVal) * 100
                    return (
                      <div
                        key={date}
                        className="flex-1 bg-emerald-500/80 rounded-t hover:bg-emerald-400 relative group min-w-[8px]"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${date}: ${count} clicks`}
                      />
                    )
                  })}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  Last 30 days
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">By Country</h3>
                {stats.clicksByCountry.length > 0 ? (
                  <BarChart data={stats.clicksByCountry} labelKey="country" valueKey="_count" color="bg-blue-500" />
                ) : (
                  <p className="text-zinc-600 text-sm">No data</p>
                )}
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">By Device</h3>
                {stats.clicksByDevice.length > 0 ? (
                  <BarChart data={stats.clicksByDevice} labelKey="device" valueKey="_count" color="bg-purple-500" />
                ) : (
                  <p className="text-zinc-600 text-sm">No data</p>
                )}
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">By Browser</h3>
                {stats.clicksByBrowser.length > 0 ? (
                  <BarChart data={stats.clicksByBrowser} labelKey="browser" valueKey="_count" color="bg-amber-500" />
                ) : (
                  <p className="text-zinc-600 text-sm">No data</p>
                )}
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">By OS</h3>
                {stats.clicksByOs.length > 0 ? (
                  <BarChart data={stats.clicksByOs} labelKey="os" valueKey="_count" color="bg-rose-500" />
                ) : (
                  <p className="text-zinc-600 text-sm">No data</p>
                )}
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">By Referrer</h3>
                {stats.clicksByReferrer.length > 0 ? (
                  <BarChart data={stats.clicksByReferrer} labelKey="referrer" valueKey="_count" color="bg-cyan-500" />
                ) : (
                  <p className="text-zinc-600 text-sm">No data</p>
                )}
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">By UTM Source</h3>
                {stats.clicksByUtmSource.length > 0 ? (
                  <BarChart data={stats.clicksByUtmSource} labelKey="utmSource" valueKey="_count" color="bg-emerald-500" />
                ) : (
                  <p className="text-zinc-600 text-sm">No UTM data</p>
                )}
              </section>
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-4">Recent Clicks</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                      <th className="text-left py-2 px-2">Time</th>
                      <th className="text-left py-2 px-2">Country</th>
                      <th className="text-left py-2 px-2">City</th>
                      <th className="text-left py-2 px-2">Browser</th>
                      <th className="text-left py-2 px-2">OS</th>
                      <th className="text-left py-2 px-2">Device</th>
                      <th className="text-left py-2 px-2">Screen</th>
                      <th className="text-left py-2 px-2">Referrer</th>
                      <th className="text-left py-2 px-2">Bounced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lastClicks.map((click) => (
                      <tr key={click.id} className="border-b border-zinc-800/30 text-zinc-300 text-xs hover:bg-zinc-900/50">
                        <td className="py-2 px-2 whitespace-nowrap">
                          {new Date(click.clickedAt).toLocaleString()}
                        </td>
                        <td className="py-2 px-2">{click.country || '-'}</td>
                        <td className="py-2 px-2">{click.city || '-'}</td>
                        <td className="py-2 px-2">{click.browser || '-'}</td>
                        <td className="py-2 px-2">{click.os || '-'}</td>
                        <td className="py-2 px-2">{click.device || '-'}</td>
                        <td className="py-2 px-2 font-mono text-zinc-500">
                          {click.screenWidth ? `${click.screenWidth}x${click.screenHeight}` : '-'}
                        </td>
                        <td className="py-2 px-2 max-w-[120px] truncate" title={click.referrer || ''}>
                          {click.referrer ? new URL(click.referrer).hostname : '-'}
                        </td>
                        <td className="py-2 px-2">
                          {click.bounced ? (
                            <span className="text-red-400">Yes</span>
                          ) : (
                            <span className="text-green-500">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
