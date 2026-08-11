export const AGENT_VISIBILITY = Object.freeze({
  PRIVATE: 'private',
  SHARED: 'shared',
  PUBLIC: 'public',
})

const VISIBILITIES = Object.values(AGENT_VISIBILITY)

/** Configuration for an AI evaluator that can be reused across heuristic tests. */
export default class HeuristicAgent {
  constructor({
    id = null,
    name,
    description = '',
    ownerId,
    visibility = AGENT_VISIBILITY.PRIVATE,
    sharedWith = [],
    provider = '',
    model = '',
    systemPrompt = '',
    temperature = 0.2,
    capabilities = [],
    createdAt = null,
    updatedAt = null,
  } = {}) {
    if (!name?.trim()) throw new Error('Agent name is required.')
    if (!ownerId?.trim()) throw new Error('Agent ownerId is required.')
    if (!VISIBILITIES.includes(visibility)) {
      throw new Error(`Unsupported agent visibility: ${visibility}`)
    }

    this.id = id
    this.name = name.trim()
    this.description = description.trim()
    this.ownerId = ownerId
    this.visibility = visibility
    this.sharedWith = [...new Set(sharedWith.filter(Boolean))]
    this.provider = provider
    this.model = model
    this.systemPrompt = systemPrompt
    this.temperature = Math.min(2, Math.max(0, Number(temperature) || 0))
    this.capabilities = [...new Set(capabilities.filter(Boolean))]
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  canBeUsedBy(userId) {
    return (
      this.visibility === AGENT_VISIBILITY.PUBLIC ||
      this.ownerId === userId ||
      (this.visibility === AGENT_VISIBILITY.SHARED &&
        this.sharedWith.includes(userId))
    )
  }

  toFirestore() {
    const { id, ...data } = this
    return data
  }

  static fromFirestore(data, id = null) {
    return new HeuristicAgent({ id, ...data })
  }
}
