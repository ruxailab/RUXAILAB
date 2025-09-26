import { functions } from '../f.firebase.js'
import UserRepository from '../repositories/UserRepository.js'

export const onTestCreate = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'created',
  handler: async (event) => {
    const snapshot = event.data
    if (!snapshot) return console.log("No data associated with the event")

    const test = snapshot.data()
    const userRepository = new UserRepository()
    const user = await userRepository.get(test.testAdmin.userDocId)

    user.myTests[snapshot.id] = {
      testDocId: snapshot.id,
      testTitle: test.testTitle || test.title || 'Untitled Test',
      testType: test.testType || 'UNKNOWN',
      subType: test.subType || null,
      numberColaborators: test.cooperators?.length || 0,
      creationDate: test.creationDate || test.createdAt || Date.now(),
      updateDate: Date.now(),
    }

    await userRepository.update(test.testAdmin.userDocId, user)
  },
})
