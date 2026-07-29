'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [result, setResult] = useState<{ shortUrl: string; code: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title: title || undefined, utmSource, utmMedium, utmCampaign }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error creating link')
        return
      }

      setResult(data)
      setUrl('')
      setTitle('')
      setUtmSource('')
      setUtmMedium('')
      setUtmCampaign('')
    } catch {
      setError('Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-emerald-400">Trackr</h1>
          <Link
            href="/stats"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Create Tracked Link</h2>
          <p className="text-zinc-400">
            Every click captures IP, geolocation, device, browser, OS, screen, connection, fonts, canvas fingerprint, WebGL, and more.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Destination URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campanha Twitch Season 3"
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <details className="border border-zinc-800 rounded-lg">
            <summary className="px-4 py-2.5 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 select-none">
              UTM Parameters (optional)
            </summary>
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Source</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="twitch, instagram"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-100 placeholder-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Medium</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="social, email"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-100 placeholder-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Campaign</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="season-3-launch"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-100 placeholder-zinc-500"
                />
              </div>
            </div>
          </details>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create Tracked Link'}
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Link Created!</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={result.shortUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-emerald-400 text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <Link
              href={`/stats/${result.code}`}
              className="inline-block mt-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View Stats &rarr;
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
