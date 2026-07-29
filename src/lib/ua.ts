import { UAParser } from 'ua-parser-js'

export interface UAResult {
  browser: string | null
  browserVersion: string | null
  os: string | null
  osVersion: string | null
  device: string | null
  deviceModel: string | null
}

export function parseUA(userAgent: string): UAResult {
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  const device = parser.getDevice()

  let deviceType = 'desktop'
  if (device.type === 'mobile') deviceType = 'mobile'
  else if (device.type === 'tablet') deviceType = 'tablet'

  return {
    browser: browser.name || null,
    browserVersion: browser.version || null,
    os: os.name || null,
    osVersion: os.version || null,
    device: deviceType,
    deviceModel: device.model || null,
  }
}
