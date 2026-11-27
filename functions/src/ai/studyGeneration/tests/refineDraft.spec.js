import {
  InvalidCurrentDraftError,
  MAX_CURRENT_DRAFT_CHARS,
  applyRefinement,
  mergeRefinedDraft,
  sanitizeCurrentDraft,
} from '../refinement/refineDraft.js'
import { diffStudyDrafts } from '../refinement/diffDrafts.js'
import {
  cardSortingDraft,
  cardTitles,
  clarificationDraft,
  focusGroupDraft,
  withCards,
} from './helpers/drafts.js'

const refineCards = (titles, changedSections) =>
  mergeRefinedDraft({
    currentDraft: cardSortingDraft(),
    refinedDraft: withCards(cardSortingDraft(), titles),
    changedSections,
  })

describe('sanitizeCurrentDraft', () => {
  it('returns null when no draft is sent', () => {
    expect(sanitizeCurrentDraft(undefined)).toBeNull()
    expect(sanitizeCurrentDraft(null)).toBeNull()
  })

  it('drops system and clarification fields', () => {
    const draft = sanitizeCurrentDraft({
      ...cardSortingDraft(),
      id: 'study-1',
      testAdmin: { userDocId: 'someone' },
      clarificationQuestions: ['Ready!'],
    })

    expect(draft).not.toHaveProperty('id')
    expect(draft).not.toHaveProperty('testAdmin')
    expect(draft.clarificationQuestions).toEqual([])
    expect(cardTitles(draft)).toEqual(['TV', 'Sink', 'Stove'])
  })

  it.each([
    ['not an object', ['draft']],
    ['incomplete', cardSortingDraft({ testTitle: '' })],
    [
      'too large',
      cardSortingDraft({
        testDescription: 'x'.repeat(MAX_CURRENT_DRAFT_CHARS),
      }),
    ],
  ])('rejects a draft that is %s', (_label, raw) => {
    expect(() => sanitizeCurrentDraft(raw)).toThrow(InvalidCurrentDraftError)
  })
})

describe('mergeRefinedDraft', () => {
  it('keeps every section the model did not declare as changed', () => {
    const refinedDraft = cardSortingDraft({
      testTitle: 'Renamed by the model',
      testStructure: {
        ...withCards(cardSortingDraft(), ['Sofa']).testStructure,
        welcomeMessage: 'Hello there',
      },
    })

    const merged = mergeRefinedDraft({
      currentDraft: cardSortingDraft(),
      refinedDraft,
      changedSections: [{ section: 'welcomeMessage' }],
    })

    expect(merged).toEqual({
      ...cardSortingDraft(),
      testStructure: {
        ...cardSortingDraft().testStructure,
        welcomeMessage: 'Hello there',
      },
    })
  })

  it.each([
    [
      'restores an item dropped by accident in place',
      ['TV', 'Stove', 'Sofa'],
      [{ section: 'cards' }],
      ['TV', 'Sink', 'Stove', 'Sofa'],
    ],
    [
      'removes an item only when it is declared removed',
      ['TV', 'Stove'],
      [{ section: 'cards', removed: ['sink'] }],
      ['TV', 'Stove'],
    ],
    [
      'keeps the original order unless a reorder is declared',
      ['Stove', 'TV', 'Sink'],
      [{ section: 'cards' }],
      ['TV', 'Sink', 'Stove'],
    ],
    [
      'accepts a declared reorder',
      ['Stove', 'TV', 'Sink'],
      [{ section: 'cards', reordered: true }],
      ['Stove', 'TV', 'Sink'],
    ],
    [
      'keeps a new item next to the item it followed',
      ['Lamp', 'TV', 'Sink', 'Fridge', 'Stove'],
      ['cards'],
      ['Lamp', 'TV', 'Sink', 'Fridge', 'Stove'],
    ],
    [
      'treats a declared rename as remove plus add in the same place',
      ['TV', 'Sink unit', 'Stove'],
      [{ section: 'cards', removed: ['Sink'] }],
      ['TV', 'Sink unit', 'Stove'],
    ],
    [
      'blocks removals when the model sends no changedSections',
      ['TV'],
      undefined,
      ['TV', 'Sink', 'Stove'],
    ],
  ])('cards: %s', (_label, refinedTitles, changedSections, expected) => {
    expect(cardTitles(refineCards(refinedTitles, changedSections))).toEqual(
      expected,
    )
  })

  it('ignores a method switch the model did not declare', () => {
    const merged = mergeRefinedDraft({
      currentDraft: cardSortingDraft(),
      refinedDraft: focusGroupDraft(),
      changedSections: [{ section: 'discussionGuide' }],
    })

    expect(merged).toEqual(cardSortingDraft())
  })

  it('switches method when declared and keeps the hand-edited title', () => {
    const merged = mergeRefinedDraft({
      currentDraft: cardSortingDraft({ testTitle: 'My own title' }),
      refinedDraft: focusGroupDraft(),
      changedSections: [
        { section: 'testType' },
        { section: 'discussionGuide' },
      ],
    })

    expect(merged.testType).toBe('FOCUS_GROUP')
    expect(merged.testTitle).toBe('My own title')
    expect(merged.discussionGuide).toEqual(focusGroupDraft().discussionGuide)
  })
})

describe('diffStudyDrafts', () => {
  it('reports list and value changes from the data', () => {
    const after = withCards(cardSortingDraft({ testDescription: 'New' }), [
      'Sink',
      'TV',
      'Sofa',
    ])
    after.testStructure.cardSorting.cards[0].description = 'Under the window'

    expect(diffStudyDrafts(cardSortingDraft(), after)).toEqual([
      { section: 'testDescription', kind: 'value' },
      {
        section: 'cards',
        kind: 'list',
        added: ['Sofa'],
        removed: ['Stove'],
        updated: ['Sink'],
        reordered: true,
      },
    ])
  })

  it('returns no changes for identical drafts', () => {
    expect(diffStudyDrafts(cardSortingDraft(), cardSortingDraft())).toEqual([])
  })

  it('reports a method switch first', () => {
    const changes = diffStudyDrafts(cardSortingDraft(), focusGroupDraft())
    expect(changes.map((change) => change.section)).toEqual([
      'testType',
      'testTitle',
      'testDescription',
    ])
  })
})

describe('applyRefinement', () => {
  const apply = (draft, changedSections) =>
    applyRefinement({
      currentDraft: cardSortingDraft(),
      draft,
      changedSections,
      locale: 'en-US',
    })

  it('passes clarification drafts through with no changes', () => {
    const draft = clarificationDraft()
    expect(apply(draft, [])).toEqual({ draft, changes: [] })
  })

  it('returns a clarification when the merged draft is invalid', () => {
    const refined = cardSortingDraft()
    refined.testStructure.cardSorting.categories = []

    const result = apply(refined, [
      { section: 'categories', removed: ['Living room', 'Kitchen'] },
    ])

    expect(result.draft.clarificationNeeded).toBe(true)
    expect(result.changes).toEqual([])
  })

  it('returns the merged draft with its changes', () => {
    const refined = withCards(cardSortingDraft(), [
      'TV',
      'Sink',
      'Stove',
      'Sofa',
    ])
    refined.clarificationQuestions = ['Done. Anything else?']

    const result = apply(refined, ['cards'])

    expect(cardTitles(result.draft)).toEqual(['TV', 'Sink', 'Stove', 'Sofa'])
    expect(result.draft.clarificationQuestions).toEqual([
      'Done. Anything else?',
    ])
    expect(result.changes).toEqual([
      expect.objectContaining({ section: 'cards', added: ['Sofa'] }),
    ])
  })
})
