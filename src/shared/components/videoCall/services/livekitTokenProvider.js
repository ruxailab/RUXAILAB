const DEFAULT_LIVEKIT_URL = 'ws://localhost:7880'

function isBrowserSecureContext() {
  return typeof window !== 'undefined' && window.isSecureContext
}

function isLocalhostHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function stripTrailingSlash(url) {
  return url.replace(/\/$/, '')
}

function getTokenServerUrl() {
  const url = process.env.VUE_APP_LIVEKIT_TOKEN_SERVER_URL?.replace(/\/$/, '')
  return upgradeHttpUrlForSecureContext(url)
}

function getClientLiveKitUrl() {
  return process.env.VUE_APP_LIVEKIT_URL || ''
}

function upgradeHttpUrlForSecureContext(url) {
  if (!url || !isBrowserSecureContext()) return url

  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:'
      return stripTrailingSlash(parsed.toString())
    }
  } catch {
    return url
  }

  return url
}

/**
 * livekit-server --dev speaks plain WebSocket (ws://), not TLS (wss://).
 * Normalize URLs for local HTTP dev and HTTPS tunnels (e.g. ngrok).
 */
function normalizeLiveKitUrl(url) {
  if (!url) {
    return isBrowserSecureContext() ? null : DEFAULT_LIVEKIT_URL
  }

  try {
    const parsed = new URL(url)
    const isLocalhost = isLocalhostHostname(parsed.hostname)

    if (isBrowserSecureContext()) {
      if (parsed.protocol === 'ws:' || parsed.protocol === 'http:') {
        if (isLocalhost) {
          throw new Error(
            'LiveKit localhost URL cannot be used from HTTPS. Set VUE_APP_LIVEKIT_URL to your ngrok wss:// tunnel and restart npm run serve.',
          )
        }

        parsed.protocol = parsed.protocol === 'ws:' ? 'wss:' : 'https:'
        return stripTrailingSlash(parsed.toString())
      }

      return stripTrailingSlash(url)
    }

    if (isLocalhost && parsed.protocol === 'wss:') {
      parsed.protocol = 'ws:'
      return stripTrailingSlash(parsed.toString())
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('LiveKit localhost')) {
      throw error
    }
    return url
  }

  return url
}

function resolveLiveKitUrl(serverUrl) {
  const clientUrl = getClientLiveKitUrl()
  const raw = clientUrl || serverUrl || DEFAULT_LIVEKIT_URL
  return normalizeLiveKitUrl(raw)
}

function buildTokenServerRequestInit(tokenServerUrl) {
  const requestInit = { credentials: 'omit' }

  if (tokenServerUrl.includes('ngrok')) {
    requestInit.headers = { 'ngrok-skip-browser-warning': 'true' }
  }

  return requestInit
}

export async function getLiveKitCredentials({
  testId,
  userId,
  displayName,
  accessLevel,
}) {
  const tokenServerUrl = getTokenServerUrl()
  if (!tokenServerUrl) {
    throw new Error(
      'Missing VUE_APP_LIVEKIT_TOKEN_SERVER_URL. Start test/livekit/token-server (npm run dev).',
    )
  }

  if (!testId || !userId) {
    throw new Error('Missing testId or userId for LiveKit token request.')
  }

  const params = new URLSearchParams({
    roomName: testId,
    participantName: displayName || userId,
    identity: userId,
    accessLevel: String(accessLevel ?? ''),
  })

  const response = await fetch(
    `${tokenServerUrl}/api/connection-details?${params.toString()}`,
    buildTokenServerRequestInit(tokenServerUrl),
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      message || `LiveKit token server responded with ${response.status}`,
    )
  }

  const data = await response.json()

  if (!data?.participantToken) {
    throw new Error('LiveKit token server returned an invalid response.')
  }

  return {
    token: data.participantToken,
    url: resolveLiveKitUrl(data.serverUrl),
    roomName: data.roomName || testId,
  }
}
