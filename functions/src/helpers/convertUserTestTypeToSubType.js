import { FieldValue } from 'firebase-admin/firestore'
import { admin, functions } from '../f.firebase.js'

export const consertUserTestTypeToSubType = functions.onRequest({
  handler: async (req, res) => {
    const db = admin.firestore()

    await updateUserTestTypeInTest(db)

    await updateUserTestTypeInUser(db)

    await updateUserTestTypeInAnswer(db)

    await updateUserTestTypeInTempleate(db)
    return res.status(200).send()
  },
})

async function updateUserTestTypeInTest(db) {
  const snap = await db.collection('tests').get()
  const docs = snap.docs

  for (let i = 0; i < docs.length; i += 500) {
    const slice = docs.slice(i, i + 500)
    const batch = db.batch()

    for (const doc of slice) {
      const data = doc.data()
      const updatePayload = {}

      const hasUserTestType = Object.prototype.hasOwnProperty.call(
        data,
        'userTestType',
      )
      if (hasUserTestType) {
        updatePayload.userTestType = FieldValue.delete()
        if (data.userTestType == 'moderated')
          updatePayload['subType'] = 'USER_MODERATED'
        if (data.userTestType == 'unmoderated')
          updatePayload['subType'] = 'USER_UNMODERATED'
      }

      if (data.testType == 'User' || data.testType == 'USER') {
        const hasFinalMessage = Object.prototype.hasOwnProperty.call(
          data.testStructure,
          'finalMessage',
        )
        if (hasFinalMessage) {
          const value = data.testStructure.finalMessage
          updatePayload['testStructure.finalMessage'] = FieldValue.delete()
          updatePayload['testStructure.studyConclusion'] = value
        }
      }

      if (data.testType === 'User') updatePayload['testType'] = 'USER'
      if (data.testType === 'CardSorting')
        updatePayload['testType'] = 'CARD_SORTING'
      if (data.testType === 'HEURISTICS')
        updatePayload['testType'] = 'HEURISTIC'
      if (Object.keys(updatePayload).length > 0)
        batch.update(doc.ref, updatePayload)
    }

    await batch.commit()
  }
}

async function updateUserTestTypeInUser(db) {
  const snap = await db.collection('users').get()

  const docs = snap.docs

  for (let i = 0; i < docs.length; i += 500) {
    const slice = docs.slice(i, i + 500)
    const batch = db.batch()

    for (const doc of slice) {
      const data = doc.data() || {}
      const answers = data.myAnswers
      if (answers == null) continue

      const updatePayload = {}

      const handleEntry = (key, entry) => {
        if (!entry || typeof entry !== 'object') return
        const base = `myAnswers.${key}`

        const hasUserTestType = Object.prototype.hasOwnProperty.call(
          entry,
          'userTestType',
        )
        if (hasUserTestType)
          updatePayload[`${base}.userTestType`] = FieldValue.delete()

        if (entry.subType == 'moderated' || entry.userTestType == 'moderated')
          updatePayload[`${base}.subType`] = 'USER_MODERATED'
        if (
          entry.subType == 'unmoderated' ||
          entry.userTestType == 'unmoderated'
        )
          updatePayload[`${base}.subType`] = 'USER_UNMODERATED'

        if (entry.testType === 'User')
          updatePayload[`${base}.testType`] = 'USER'
        if (entry.testType === 'CardSorting')
          updatePayload[`${base}.testType`] = 'CARD_SORTING'
        if (entry.testType === 'HEURISTICS')
          updatePayload[`${base}.testType`] = 'HEURISTIC'
      }

      if (Array.isArray(answers)) {
        for (let idx = 0; idx < answers.length; idx++)
          handleEntry(idx, answers[idx])
      } else if (typeof answers === 'object') {
        for (const [key, entry] of Object.entries(answers))
          handleEntry(key, entry)
      } else {
        continue
      }

      if (Object.keys(updatePayload).length > 0)
        batch.update(doc.ref, updatePayload)
    }

    await batch.commit()
  }
}

async function updateUserTestTypeInTempleate(db) {
  const snap = await db.collection('templates').get()
  const docs = snap.docs

  for (let i = 0; i < docs.length; i += 500) {
    const slice = docs.slice(i, i + 500)
    const batch = db.batch()

    for (const doc of slice) {
      const data = doc.data()
      const updatePayload = {}

      if (data.header.templateType === 'User')
        updatePayload['header.templateType'] = 'USER'
      if (data.header.templateType === 'CardSorting')
        updatePayload['header.templateType'] = 'CARD_SORTING'
      if (data.header.templateType === 'HEURISTICS')
        updatePayload['header.templateType'] = 'HEURISTIC'
      if (Object.keys(updatePayload).length > 0)
        batch.update(doc.ref, updatePayload)
    }

    await batch.commit()
  }
}

async function updateUserTestTypeInAnswer(db) {
  const snap = await db.collection('answers').get()
  const docs = snap.docs

  for (let i = 0; i < docs.length; i += 500) {
    const slice = docs.slice(i, i + 500)
    const batch = db.batch()

    for (const doc of slice) {
      const data = doc.data()
      const updatePayload = {}

      if (data.type === 'User') updatePayload['type'] = 'USER'
      if (data.type === 'CardSorting') updatePayload['type'] = 'CARD_SORTING'
      if (data.type === 'HEURISTICS') updatePayload['type'] = 'HEURISTIC'
      if (Object.keys(updatePayload).length > 0)
        batch.update(doc.ref, updatePayload)
    }

    await batch.commit()
  }
}
