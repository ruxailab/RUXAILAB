import { AI_USER_SUBTYPES } from '../schemas/studyDraft.schema'

/**
 * Validates User Test draft content.
 * @param {object} draft
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateUserTestDraft(draft) {
  const errors = []

  if (!AI_USER_SUBTYPES.includes(draft?.subType)) {
    errors.push(
      `subType must be one of: ${AI_USER_SUBTYPES.join(', ')}`,
    )
  }

  const structure = draft?.testStructure
  if (!structure || typeof structure !== 'object' || Array.isArray(structure)) {
    errors.push('testStructure must be an object for USER')
    return { valid: false, errors }
  }

  const tasks = structure.userTasks
  if (!Array.isArray(tasks) || tasks.length < 1) {
    errors.push('testStructure.userTasks must have at least 1 task')
  } else {
    tasks.forEach((task, index) => {
      if (!task?.taskName || String(task.taskName).trim() === '') {
        errors.push(`userTasks[${index}].taskName is required`)
      }
      if (!task?.taskDescription || String(task.taskDescription).trim() === '') {
        errors.push(`userTasks[${index}].taskDescription is required`)
      }
    })
  }

  return { valid: errors.length === 0, errors }
}
