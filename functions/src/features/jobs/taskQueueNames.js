/**
 * Cloud Tasks worker bound to each queued job type in this project.
 */
export const TASK_QUEUE_BY_TYPE = Object.freeze({
  transcription: 'transcriptionTaskWorker',
  facial: 'facialSentimentTaskWorker',
  text: 'textSentimentTaskWorker',
})
