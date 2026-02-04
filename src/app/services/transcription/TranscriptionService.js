// app/services/transcription/TranscriptionService.js
import httpClient from '@/app/services/http/axiosInstance'

// Create a configured instance with custom base URL
export const transcriptionApi = {
  async post(url, data, config = {}) {
    return httpClient.post(
      process.env.VUE_APP_TRANSCRIPTION_API_BASE_URL + url,
      data,
      config,
    )
  },
  async get(url, config = {}) {
    return httpClient.get(
      process.env.VUE_APP_TRANSCRIPTION_API_BASE_URL + url,
      config,
    )
  },
}

export async function transcribe({ audio_url, provider, model }) {
  const { data } = await transcriptionApi.post('/api/v1/transcribe', {
    audio_url,
    provider,
    model,
  })
  return data
}
