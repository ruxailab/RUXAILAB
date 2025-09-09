import { admin, functions } from "../f.firebase.js";

export const addSubTypeInUser = functions.onRequest({
  handler: async (req, res) => {
    const db = admin.firestore()

    const snap = await db.collection('users').get()
    const docs = snap.docs
    console.log(`Users Encontrados: ${snap.size}`)

    for (let i = 0; i < docs.length; i += 500) {
      const slice = docs.slice(i, i + 500)

      const results = await Promise.all(slice.map(async (doc) => {
        const data = doc.data()
        if (!data.myTests) return null

        const updates = await Promise.all(
          Object.entries(data.myTests).map(([key, entry]) =>
            handleEntry(key, entry, db)
          )
        )

        const updatePayload = Object.assign({}, ...updates.filter(Boolean))
        if (Object.keys(updatePayload).length === 0) return null

        return { ref: doc.ref, updatePayload }
      }))

      const batch = db.batch();
      results.filter(Boolean).forEach(r => batch.update(r.ref, r.updatePayload));
      await batch.commit();

      console.log(`Batch commit: ${Math.min(i + 500, docs.length)} / ${docs.length}`)
    }
    return res.status(200).send()
  }
})

async function handleEntry(key, entry, db) {
  if (!entry || typeof entry !== 'object') return null
  const base = `myTests.${key}`
  const payload = {}

  if (entry.testType === 'User') payload[`${base}.testType`] = 'USER'
  if (entry.testType === 'CardSorting') payload[`${base}.testType`] = 'CARD_SORTING'
  if (entry.testType === 'HEURISTICS') payload[`${base}.testType`] = 'HEURISTIC'

  if (entry.testType == 'User' || entry.testType == 'USER') {
    if (!entry.testDocId) return payload

    const testdDoc = await db.collection('tests').doc(entry.testDocId).get()
    const testData = testdDoc.data()

    if (testData.subType == 'USER_MODERATED' || testData.userTestType == 'moderated') payload[`${base}.subType`] = 'USER_MODERATED'
    if (testData.subType == 'USER_UNMODERATED' || testData.userTestType == 'unmoderated') payload[`${base}.subType`] = 'USER_UNMODERATED'
  }

  return payload
}
