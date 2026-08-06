import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import AIAgent, { AGENT_VISIBILITY } from '../models/AIAgent'

const COLLECTION = 'heuristicAgents'

export default class AIAgentController extends Controller {
  async createAgent(data, ownerId) {
    const agent = new AIAgent({ ...data, ownerId })
    const now = Date.now()
    const ref = await super.create(COLLECTION, {
      ...agent.toFirestore(),
      createdAt: now,
      updatedAt: now,
    })
    return new AIAgent({ ...agent, id: ref.id, createdAt: now, updatedAt: now })
  }

  async getAgent(id, userId) {
    const snapshot = await super.readOne(COLLECTION, id)
    if (!snapshot.exists()) return null
    const agent = AIAgent.fromFirestore(snapshot.data(), snapshot.id)
    if (!agent.canBeUsedBy(userId)) {
      throw new Error('User cannot access this agent.')
    }
    return agent
  }

  async listAvailable(userId) {
    if (!userId) return []
    const snapshots = await Promise.all([
      super.query(COLLECTION, {
        field: 'ownerId',
        condition: '==',
        value: userId,
      }),
      super.query(COLLECTION, {
        field: 'sharedWith',
        condition: 'array-contains',
        value: userId,
      }),
      super.query(COLLECTION, {
        field: 'visibility',
        condition: '==',
        value: AGENT_VISIBILITY.PUBLIC,
      }),
    ])
    const unique = new Map()
    snapshots.forEach((snapshot) => {
      snapshot.docs.forEach((document) => {
        unique.set(
          document.id,
          AIAgent.fromFirestore(document.data(), document.id),
        )
      })
    })
    return [...unique.values()]
  }

  async updateAgent(id, changes, userId) {
    const current = await this.getAgent(id, userId)
    if (current.ownerId !== userId) {
      throw new Error('Only the owner can update an agent.')
    }
    const candidate = new AIAgent({ ...current, ...changes, id })
    await super.update(COLLECTION, id, {
      ...candidate.toFirestore(),
      updatedAt: Date.now(),
    })
    return candidate
  }

  async shareAgent(id, ownerId, userIds) {
    return this.updateAgent(
      id,
      { visibility: AGENT_VISIBILITY.SHARED, sharedWith: userIds },
      ownerId,
    )
  }

  async deleteAgent(id, userId) {
    const agent = await this.getAgent(id, userId)
    if (agent.ownerId !== userId) {
      throw new Error('Only the owner can delete an agent.')
    }
    return super.delete(COLLECTION, id)
  }
}
