import { admin, functions } from '../f.firebase.js'

const error = (code, message) =>
  new functions.https.HttpsError(code, message)

const buildStudyRoleMap = (cooperators = []) =>
  cooperators.reduce((roles, cooperator) => {
    if (
      cooperator?.accepted === true &&
      cooperator?.userDocId &&
      Number.isInteger(cooperator?.accessLevel)
    ) {
      roles[cooperator.userDocId] = cooperator.accessLevel
    }
    return roles
  }, {})

export const backfillStudyAccessMetadata = functions.onCall({
  handler: async (request) => {
    const uid = request?.auth?.uid
    if (!uid) throw error('unauthenticated', 'Authentication is required')

    const db = admin.firestore()
    const userSnap = await db.collection('users').doc(uid).get()
    if (!userSnap.exists || userSnap.data()?.accessLevel !== 0) {
      throw error('permission-denied', 'Platform Super Admin is required')
    }

    const testsSnap = await db.collection('tests').get()
    let batch = db.batch()
    let operations = 0
    let studiesUpdated = 0
    let answersUpdated = 0

    const commitBatchIfFull = async () => {
      if (operations < 400) return
      await batch.commit()
      batch = db.batch()
      operations = 0
    }

    for (const testSnap of testsSnap.docs) {
      const study = testSnap.data()
      batch.set(
        testSnap.ref,
        { studyRoleMap: buildStudyRoleMap(study.cooperators) },
        { merge: true },
      )
      operations += 1
      studiesUpdated += 1
      await commitBatchIfFull()

      if (study.answersDocId) {
        batch.set(
          db.collection('answers').doc(study.answersDocId),
          {
            studyId: testSnap.id,
            createdBy: study.testAdmin?.userDocId || null,
          },
          { merge: true },
        )
        operations += 1
        answersUpdated += 1
        await commitBatchIfFull()
      }
    }

    if (operations > 0) await batch.commit()

    return { studiesUpdated, answersUpdated }
  },
})
