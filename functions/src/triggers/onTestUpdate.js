import { functions } from '../f.firebase.js'
import UserRepository from '../repositories/UserRepository.js'

export const onTestUpdate = functions.onTrigger({
  path: 'tests/{docId}',
  event: 'updated',
  handler: async (event) => {
    const snapshot = event.data.after
    if (!snapshot) return console.log("No data associated with the event")

    const newTest = snapshot.data()
    const userRepository = new UserRepository()
    const user = await userRepository.get(newTest.testAdmin.userDocId)

    user.myTests[snapshot.id] = {
      testDocId: snapshot.id,
      testTitle: newTest.testTitle,
      testType: newTest.testType,
      subType: newTest.subType,
      numberColaborators: newTest.cooperators.length || 0,
      creationDate: newTest.creationDate,
      updateDate: Date.now(),
    }

    await userRepository.update(newTest.testAdmin.userDocId, user)
  }
})
