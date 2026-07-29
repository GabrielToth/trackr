'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LinkItem {
  id: string
  code: string
  url: string
  title: string | null
  createdAt: string
  clicks: number
  clicksLast24h: number
  uniqueCountries: number
}

export default function StatsPage() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/links')
      .then((res) => res.json())
      .then((data) => setLinks(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-emerald-400">Trackr</Link>
            <span className="text-sm text-zinc-500">/</span>
            <span className="text-sm text-zinc-300">Dashboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">All Links</h1>

        {links.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-2">No links yet</p>
            <Link href="/" className="text-emerald-400 hover:text-emerald-300">
              Create your first tracked link
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left py-3 px-2">Title / URL</th>
                  <th className="text-right py-3 px-2">Total Clicks</th>
                  <th className="text-right py-3 px-2">Last 24h</th>
                  <th className="text-right py-3 px-2">Countries</th>
                  <th className="text-right py-3 px-2">Created</th>
                  <th className="text-right py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                    <td className="py-3 px-2">
                      <div className="font-medium text-zinc-100">{link.title || 'Untitled'}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-xs">{link.url}</div>
                    </td>
                    <td className="text-right py-3 px-2 text-zinc-100 font-mono">{link.clicks}</td>
                    <td className="text-right py-3 px-2 text-emerald-400 font-mono">{link.clicksLast24h}</td>
                    <td className="text-right py-3 px-2 text-zinc-100 font-mono">{link.uniqueCountries}</td>
                    <td className="text-right py-3 px-2 text-zinc-400 text-xs">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right py-3 px-2">
                      <Link
                        href={`/stats/${link.code}`}
                        className="text-emerald-400 hover:text-emerald-300 text-xs"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
