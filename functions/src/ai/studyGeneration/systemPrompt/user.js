/**
 * USER (moderated / unmoderated) method prompt fragment.
 */

export const METHOD_KEY = 'USER'

/**
 * @returns {string}
 */
export function buildUserPrompt() {
  return `USER:
- subType required: "USER_MODERATED" or "USER_UNMODERATED"
- testStructure is an OBJECT with welcomeMessage, finalMessage, consent, preTest, postTest, userTasks
- userTasks: at least one { taskName, taskDescription, taskTip, taskLink, postQuestion, postForm, taskType, hasAudioRecord, hasScreenRecord, hasCamRecord, hasEye, estimatedTime }`
}
