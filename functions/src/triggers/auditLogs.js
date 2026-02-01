import { functions, admin } from '../f.firebase.js'

export const auditLogs = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'written',
  handler: async (event) => {
    const change = event.data
    const before = change.before.exists ? change.before.data() : null
    const after = change.after.exists ? change.after.data() : null

    if (!before && !after) return // Should not happen for 'written'

    const collectionName = 'auditLogs'
    const timestamp = admin.firestore.FieldValue.serverTimestamp()
    const docId = event.params.docId

    let action = ''
    let userId = 'SYSTEM'
    let targetName = 'Unknown Study'
    let details = {}

    if (!before && after) {
      action = 'create'
      userId = after.createdBy || after.testAdmin?.userDocId || 'UNKNOWN'
      targetName = after.testTitle || 'Untitled'
      details = { snapshot: after } // Store initial state
    } else if (before && after) {
      action = 'update'
      userId = after.lastModifiedBy || 'UNKNOWN'
      targetName = after.testTitle || before.testTitle || 'Untitled'

      // Basic diffing could go here, for now just logging that it changed
      // dependent on requirements, we might want to store changed fields
    } else if (before && !after) {
      action = 'delete'
      // For delete, we might not have the user who deleted it easily available
      // unless we track it elsewhere or use a callable function for deletion.
      // We'll trust the plan's limitation note.
      userId = 'UNKNOWN'
      targetName = before.testTitle || 'Untitled'
      details = { snapshot: before } // Store final state before delete
    }

    try {
      await admin.firestore().collection(collectionName).add({
        action,
        targetCollection: 'tests',
        targetId: docId,
        targetName,
        userId,
        timestamp,
        details,
      })
      console.log(`Audit log created for ${action} on test ${docId}`)
    } catch (error) {
      console.error('Error writing audit log:', error)
    }
  },
})
