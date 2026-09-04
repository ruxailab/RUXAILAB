import SentimentController from '@/ai/sentiment/SentimentController'

const sentimentController = new SentimentController()

/**
 * Shared helpers for Facial / Text sentiment panels:
 * resolve sentimentDocId from props or testAnswer.tasks and load the doc.
 *
 * @param {object} props
 * @param {string|null} [props.sentimentDocId]
 * @param {object|null} [props.testAnswer]
 * @param {string|number|null} [props.taskId]
 * @param {number} [props.selectedTask]
 */
export function useSentimentPanel(props) {
  function resolveTaskFromTestAnswer() {
    const tasks = props.testAnswer?.tasks
    if (!tasks || typeof tasks !== 'object') return null

    if (props.taskId != null && props.taskId !== '') {
      const byTaskId = tasks[props.taskId] ?? tasks[String(props.taskId)]
      if (byTaskId) return byTaskId
    }

    return (
      tasks[props.selectedTask] ?? tasks[String(props.selectedTask)] ?? null
    )
  }

  function resolveSentimentDocId() {
    if (props.sentimentDocId) return props.sentimentDocId
    const task = resolveTaskFromTestAnswer()
    return task?.sentimentDocId || null
  }

  /**
   * @returns {Promise<object|null>}
   */
  async function loadSentimentDocument() {
    const sentimentDocId = resolveSentimentDocId()
    if (!sentimentDocId) return null
    return sentimentController.getById(sentimentDocId)
  }

  return {
    resolveTaskFromTestAnswer,
    resolveSentimentDocId,
    loadSentimentDocument,
  }
}
