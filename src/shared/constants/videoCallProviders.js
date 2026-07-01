export const VIDEO_CALL_PROVIDERS = {
  MESH: 'MESH',
  LIVEKIT: 'LIVEKIT',
}

export const VIDEO_CALL_PROVIDER_LIMITS = {
  MESH: { min: 2, max: 5, labelKey: 'videoCall.providers.mesh.range' },
  LIVEKIT: { min: 5, max: 20, labelKey: 'videoCall.providers.livekit.range' },
}

export const DEFAULT_VIDEO_CALL_CONFIG = {
  provider: VIDEO_CALL_PROVIDERS.MESH,
}

export function resolveVideoCallProvider(testStructure) {
  return testStructure?.videoCall?.provider ?? VIDEO_CALL_PROVIDERS.MESH
}
