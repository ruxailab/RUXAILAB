import {
  InvalidCurrentDraftError,
  MAX_CURRENT_DRAFT_CHARS,
  listRefinementChanges,
  mergeRefinedDraft,
  mergeRefinementReply,
  sanitizeCurrentDraft,
} from '../refinement/refineDraft.js'
import { diffStudyDrafts } from '../refinement/diffDrafts.js'
import {
  cardSortingDraft,
  cardTitles,
  clarificationDraft,
  focusGroupDraft,
  heuristicDraft,
  heuristicsWith,
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
    ['incomplete', withCards(cardSortingDraft(), [])],
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

it('sanitizeCurrentDraft accepts a title cleared by hand', () => {
  expect(
    sanitizeCurrentDraft(cardSortingDraft({ testTitle: '' })).testTitle,
  ).toBe('')
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
    [
      'removes every item when a declared list comes back empty',
      [],
      [{ section: 'cards' }],
      [],
    ],
    [
      'keeps every item when an undeclared list comes back empty',
      [],
      undefined,
      ['TV', 'Sink', 'Stove'],
    ],
  ])('cards: %s', (_label, refinedTitles, changedSections, expected) => {
    expect(cardTitles(refineCards(refinedTitles, changedSections))).toEqual(
      expected,
    )
  })

  it('keeps value sections when the model sends no changedSections', () => {
    const refinedDraft = withCards(
      cardSortingDraft({ testTitle: 'Renamed by the model' }),
      ['TV', 'Sink', 'Stove', 'Sofa'],
    )
    refinedDraft.testStructure.welcomeMessage = 'Rewritten'

    const merged = mergeRefinedDraft({
      currentDraft: cardSortingDraft(),
      refinedDraft,
      changedSections: undefined,
    })

    expect(merged.testTitle).toBe('Home organization')
    expect(merged.testStructure.welcomeMessage).toBe('Welcome')
    expect(cardTitles(merged)).toEqual(['TV', 'Sink', 'Stove', 'Sofa'])
  })

  it('fills a title cleared by hand from the reply', () => {
    const merged = mergeRefinedDraft({
      currentDraft: cardSortingDraft({ testTitle: '' }),
      refinedDraft: cardSortingDraft({ testTitle: 'Suggested title' }),
      changedSections: [],
    })

    expect(merged.testTitle).toBe('Suggested title')
  })

  it.each([
    [
      'heuristics',
      heuristicDraft(),
      (draft) => ({
        ...draft,
        testStructure: heuristicsWith([
          [0, 'Visibility'],
          [1, 'Errors'],
        ]),
      }),
      (draft) => draft.testStructure,
      [0, 2, 1],
    ],
    [
      'discussion topics',
      focusGroupDraft(),
      (draft) => ({
        ...draft,
        discussionGuide: [{ ...draft.discussionGuide[0], title: 'Pricing' }],
      }),
      (draft) => draft.discussionGuide,
      ['topic-1-2', 'topic-1'],
    ],
  ])(
    'gives new %s an unused id',
    (_label, currentDraft, refine, readItems, expectedIds) => {
      const merged = mergeRefinedDraft({
        currentDraft,
        refinedDraft: refine(currentDraft),
        changedSections: [
          {
            section:
              currentDraft.testType === 'HEURISTIC'
                ? 'heuristics'
                : 'discussionGuide',
          },
        ],
      })

      expect(readItems(merged).map((item) => item.id)).toEqual(expectedIds)
    },
  )

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

  it.each([
    ['is missing', undefined],
    ['is empty', []],
  ])(
    'switches method when changedSections %s and keeps the title and description',
    (_label, changedSections) => {
      const current = cardSortingDraft({
        testTitle: 'My own title',
        testDescription: 'My own description',
      })
      const merged = mergeRefinedDraft({
        currentDraft: current,
        refinedDraft: focusGroupDraft(),
        changedSections,
      })

      expect(merged).toMatchObject({
        testType: 'FOCUS_GROUP',
        testTitle: 'My own title',
        testDescription: 'My own description',
        discussionGuide: focusGroupDraft().discussionGuide,
      })
      expect(merged.testStructure?.cardSorting).toBeUndefined()
    },
  )
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

  it('reports a method switch first, then the new method sections', () => {
    const changes = diffStudyDrafts(cardSortingDraft(), focusGroupDraft())
    expect(changes.map((change) => change.section)).toEqual([
      'testType',
      'testTitle',
      'testDescription',
      'discussionGuide',
      'focusGroupConfig',
    ])
    expect(changes[3]).toMatchObject({ added: ['First impressions'] })
  })
})

describe('mergeRefinementReply', () => {
  const merge = (reply, changedSections) =>
    mergeRefinementReply({
      currentDraft: cardSortingDraft(),
      reply,
      changedSections,
    })

  it('fills parts the reply left out from the current draft', () => {
    const reply = withCards(cardSortingDraft({ testTitle: '' }), [
      'TV',
      'Sink',
      'Stove',
      'Sofa',
    ])
    reply.clarificationQuestions = ['Done. Anything else?']

    const merged = merge(reply, ['cards'])

    expect(merged.testTitle).toBe('Home organization')
    expect(cardTitles(merged)).toEqual(['TV', 'Sink', 'Stove', 'Sofa'])
    expect(merged.clarificationQuestions).toEqual(['Done. Anything else?'])
  })

  it('keeps the current draft for a clarification reply', () => {
    const merged = merge(clarificationDraft(), [])

    expect(merged).toEqual({
      ...cardSortingDraft(),
      clarificationNeeded: true,
      clarificationQuestions: ['Which card do you mean?'],
    })
  })
})

describe('listRefinementChanges', () => {
  it('lists no changes for a clarification', () => {
    expect(
      listRefinementChanges(cardSortingDraft(), clarificationDraft()),
    ).toEqual([])
  })
})
