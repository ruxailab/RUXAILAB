import { fail } from '../../../core/errors.js'

const ALLOWED = new Set(['whisper', 'openai'])

const DEFAULT_MODEL = Object.freeze({
  whisper: 'medium',
  openai: 'whisper-1',
})

/**
 * Transcription engine + model.
 */
export class TranscriptionProvider {
  /**
   * @param {string} name
   * @param {string|null|undefined} [model]
   */
  constructor(name, model = null) {
    if (!ALLOWED.has(name)) {
      fail('invalid-argument', 'provider must be whisper or openai')
    }
    this.name = name
    this.model = model || DEFAULT_MODEL[name]
  }

  /**
   * @param {{ provider: string, model?: string|null }} params
   * @returns {TranscriptionProvider}
   */
  static create({ provider, model = null }) {
    return new TranscriptionProvider(provider, model)
  }

  get isOpenAi() {
    return this.name === 'openai'
  }

  get isLocalWhisper() {
    return this.name === 'whisper'
  }

  toJSON() {
    return { provider: this.name, model: this.model }
  }
}
