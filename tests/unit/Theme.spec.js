import Theme from '@/ux/FocusGroup/models/Theme'

describe('Theme', () => {
  it('fills in defaults and generates an id when constructed empty', () => {
    const theme = new Theme()
    expect(theme.id).toMatch(/^theme-/)
    expect(theme.label).toBe('')
    expect(theme.responseRefs).toEqual([])
  })

  it('generates unique ids', () => {
    const a = Theme.generateId()
    const b = Theme.generateId()
    expect(a).not.toBe(b)
  })

  it('round-trips through Firestore', () => {
    const theme = new Theme({
      id: 'theme-1',
      label: 'Navigation confusion',
      responseRefs: [
        {
          sessionId: 'session-1',
          topicId: 'topic-1',
          messageId: 'm1',
          participantId: 'user-1',
          excerpt: 'I could not find the menu',
        },
      ],
    })
    const data = theme.toFirestore()
    const restored = Theme.fromFirestore(data)

    expect(restored.id).toBe('theme-1')
    expect(restored.label).toBe('Navigation confusion')
    expect(restored.responseRefs).toHaveLength(1)
    expect(restored.responseRefs[0].excerpt).toBe('I could not find the menu')
  })

  it('defaults responseRefs to an empty array when missing', () => {
    const theme = new Theme({ label: 'Empty theme' })
    expect(theme.responseRefs).toEqual([])
  })
})
