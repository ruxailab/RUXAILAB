// app/services/transcription/TranscriptionService.js
import axios from 'axios'

export const transcriptionApi = axios.create({
    baseURL: process.env.VUE_APP_TRANSCRIPTION_API_BASE_URL
})

export async function transcribe({ audio_url, provider, model }) {
    const { data } = await transcriptionApi.post('/api/v1/transcribe', {
        audio_url, provider, model,
    })
    return data
}