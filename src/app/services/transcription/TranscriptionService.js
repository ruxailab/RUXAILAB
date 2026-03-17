// app/services/transcription/TranscriptionService.js
import axios from 'axios'
import axiosRetry from 'axios-retry'

export const transcriptionApi = axios.create({
  baseURL: process.env.VUE_APP_TRANSCRIPTION_API_BASE_URL,
  timeout: 10000,
})

axiosRetry(transcriptionApi, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error)
  },
})

export async function transcribe({ audio_url, provider, model }) {
  const { data } = await transcriptionApi.post('/api/v1/transcribe', {
    audio_url,
    provider,
    model,
  })
  return data
}