import Stimulus from '@/ux/FocusGroup/models/Stimulus'

describe('Stimulus', () => {
  it('fills in defaults and generates an id when constructed empty', () => {
    const stimulus = new Stimulus()

    expect(stimulus.id).toMatch(/^stimulus-/)
    expect(stimulus.type).toBe('image')
    expect(stimulus.name).toBe('')
    expect(stimulus.url).toBe('')
    expect(stimulus.storagePath).toBeNull()
    expect(stimulus.topicId).toBeNull()
    expect(typeof stimulus.createdAt).toBe('number')
  })

  it('generates unique ids', () => {
    const a = Stimulus.generateId()
    const b = Stimulus.generateId()

    expect(a).not.toBe(b)
  })

  it('round-trips an image stimulus through Firestore', () => {
    const original = new Stimulus({
      id: 'stimulus-1',
      type: 'image',
      name: 'Homepage mock',
      url: 'https://storage.example.com/homepage.png',
      storagePath: 'tests/study-1/stimulus_stimulus-1/homepage.png',
      topicId: 'topic-1',
      createdAt: 1700000000000,
    })

    const restored = Stimulus.fromFirestore(original.toFirestore())

    expect(restored).toEqual(original)
  })

  it('round-trips a url stimulus with no storagePath', () => {
    const original = new Stimulus({
      type: 'url',
      name: 'Live prototype',
      url: 'https://figma.com/proto/abc',
      topicId: null,
    })

    const restored = Stimulus.fromFirestore(original.toFirestore())

    expect(restored.storagePath).toBeNull()
    expect(restored.url).toBe('https://figma.com/proto/abc')
  })
})
