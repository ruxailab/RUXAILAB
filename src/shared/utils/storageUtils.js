/**
 * Calculate the total storage usage for a user based on their studies.
 *
 * @param {Object} user - The user object containing myTests and myAnswers.
 * @returns {number} - The total storage usage in MB.
 */
export const calculateUserStorageUsage = (user) => {
  let totalSizeMB = 0

  // Constants for estimated file sizes in MB
  const ESTIMATED_SIZES_MB = {
    VIDEO: 50,
    AUDIO: 10,
    SCREEN: 100,
    WEBCAM: 50,
    RESPONSE: 0.01, // 10KB
  }

  // Iterate through user's answers (Completed studies)
  const myAnswers = user.myAnswers || {}
  Object.values(myAnswers).forEach((answer) => {
    // Add base size for the response data itself
    totalSizeMB += ESTIMATED_SIZES_MB.RESPONSE

    const tasks = answer.tasks || {}
    const taskList = Array.isArray(tasks) ? tasks : Object.values(tasks)

    taskList.forEach((task) => {
      if (task.videoRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.VIDEO
      if (task.audioRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.AUDIO
      if (task.screenRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.SCREEN
      if (task.webcamRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.WEBCAM
    })
  })

  // Iterate through user's tests (Created studies)
  // We should also check for answers within the test if the user owns the test
  // However, usually storage is charged to the owner of the test.
  // The 'user.myTests' contains tests created by the user.
  // We need to inspect the answers *within* these tests if they are embedded or referenced.
  // Note: logic in StorageInfo.vue aggregates answers from tests.
  // If the user's structure has full test objects with answers, we can calculate.
  // If only IDs are stored, we might rely on what's passed in the 'user' object from UserController.getUserWithStudies()

  const myTests = user.myTests || {}
  Object.values(myTests).forEach((test) => {
    const answers = test.answers || {}
    const answerList = Array.isArray(answers) ? answers : Object.values(answers)

    answerList.forEach((answer) => {
      // Add base size for the response data
      totalSizeMB += ESTIMATED_SIZES_MB.RESPONSE

      const tasks = answer.tasks || {}
      const taskList = Array.isArray(tasks) ? tasks : Object.values(tasks)

      taskList.forEach((task) => {
        if (task.videoRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.VIDEO
        if (task.audioRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.AUDIO
        if (task.screenRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.SCREEN
        if (task.webcamRecordURL) totalSizeMB += ESTIMATED_SIZES_MB.WEBCAM
      })
    })
  })

  return Number.parseFloat(totalSizeMB.toFixed(2))
}
