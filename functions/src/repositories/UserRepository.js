import { admin } from '../f.firebase.js'

export default class UserRepository {
  constructor() {
    this.collectionRef = admin.firestore().collection('users')
  }

  async get(id) {
    const docRef = await this._buildDocRef(id).get()
    return docRef.data()
  }

  async update(id, payload) {
    const docRef = this._buildDocRef(id)
    await docRef.set(payload)
  }

  _buildDocRef(id) {
    return this.collectionRef.doc(id)
  }
}
