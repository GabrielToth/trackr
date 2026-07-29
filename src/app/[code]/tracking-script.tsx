'use client'

import { useEffect, useRef } from 'react'

interface Props {
  clickId: string
  trackUrl: string
  destination: string
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.font = '11pt Arial'
    ctx.fillText('Cwm fjordbank glyphs vext quiz, \ud83d\ude03', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.font = '18pt Arial'
    ctx.fillText('Cwm fjordbank glyphs', 4, 45)
    ctx.strokeStyle = '#f60'
    ctx.beginPath()
    ctx.arc(100, 25, 10, 0, Math.PI * 2)
    ctx.stroke()
    return canvas.toDataURL()
  } catch {
    return ''
  }
}

function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (!gl) return { vendor: '', renderer: '' }
    const ext = gl.getExtension('WEBGL_debug_renderer_info') as any
    if (!ext) return { vendor: '', renderer: '' }
    return {
      vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '',
      renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '',
    }
  } catch {
    return { vendor: '', renderer: '' }
  }
}

function getFonts(): string {
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif']
    const fontList = [
      'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria',
      'Cambria Math', 'Comic Sans MS', 'Consolas', 'Courier', 'Courier New',
      'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
      'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Segoe UI Light',
      'Segoe UI Semibold', 'Tahoma', 'Times New Roman', 'Trebuchet MS',
      'Verdana', 'Webdings', 'Wingdings',
    ]
    const testString = 'mmmmmmmmmmlli'
    const testSize = '72px'
    const testDiv = document.createElement('div')
    testDiv.style.position = 'absolute'
    testDiv.style.left = '-9999px'
    testDiv.style.top = '-9999px'
    testDiv.style.visibility = 'hidden'
    document.body.appendChild(testDiv)

    const baseWidths: Record<string, number> = {}
    for (const base of baseFonts) {
      testDiv.style.fontFamily = base
      testDiv.style.fontSize = testSize
      testDiv.innerHTML = testString
      baseWidths[base] = testDiv.offsetWidth
    }

    const available: string[] = []
    for (const font of fontList) {
      let isAvailable = false
      for (const base of baseFonts) {
        testDiv.style.fontFamily = `"${font}",${base}`
        testDiv.style.fontSize = testSize
        testDiv.innerHTML = testString
        if (testDiv.offsetWidth !== baseWidths[base]) {
          isAvailable = true
          break
        }
      }
      if (isAvailable) available.push(font)
    }

    document.body.removeChild(testDiv)
    return available.join(',')
  } catch {
    return ''
  }
}

function getFingerprintId(): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.font = '11pt Arial'
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 2, 15)
    const dataUrl = canvas.toDataURL()
    let hash = 0
    for (let i = 0; i < dataUrl.length; i++) {
      const char = dataUrl.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0
    }
    return hash.toString(36)
  } catch {
    return ''
  }
}

export function TrackingScript({ clickId, trackUrl, destination }: Props) {
  const sentRef = useRef(false)

  useEffect(() => {
    if (sentRef.current) return
    sentRef.current = true

    const startTime = Date.now()
    const webgl = getWebGLInfo()
    const nav = navigator as any

    const data = {
      clickId,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: devicePixelRatio || 1,
      timezoneOffset: new Date().getTimezoneOffset(),
      platform: (navigator as any).platform || '',
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || '',
      connectionType: nav.connection?.effectiveType || null,
      connectionDownlink: nav.connection?.downlink || null,
      connectionRtt: nav.connection?.rtt || null,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      fingerprintId: getFingerprintId(),
      canvasFingerprint: getCanvasFingerprint(),
      webglVendor: webgl.vendor,
      webglRenderer: webgl.renderer,
      canvasFonts: getFonts(),
      redirectDelay: Date.now() - startTime,
      bounced: false,
    }

    const sendData = (immediate: boolean) => {
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
        if (immediate) {
          navigator.sendBeacon(trackUrl, blob)
        } else {
          fetch(trackUrl, {
            method: 'POST',
            body: JSON.stringify(data),
            keepalive: true,
          }).catch(() => navigator.sendBeacon(trackUrl, blob))
        }
      } catch {
        // silent
      }
    }

    if (document.visibilityState === 'visible') {
      sendData(false)
    }

    const redirectTimer = setTimeout(() => {
      sendData(true)
      window.location.replace(destination)
    }, 200)

    const handleBeforeUnload = () => {
      clearTimeout(redirectTimer)
      sendData(true)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendData(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(redirectTimer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [clickId, trackUrl, destination])

  return null
}
