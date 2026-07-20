import { validateStudyDraft } from '@/ai/study-generation/validators'
import { mapDraftToStudyRawData } from '@/ai/study-generation/mapDraftToStudyRawData'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import {
  closedCardSortingDraft,
  openCardSortingDraft,
  hybridCardSortingDraft,
  userTestDraft,
  heuristicDraft,
  focusGroupDraft,
  clarificationDraft,
} from '@/ai/study-generation/fixtures/studyDrafts'

const user = { id: 'user-1', email: 'user@example.com' }

describe('study AI draft validators', () => {
  it('accepts the SDD closed Card Sorting fixture', () => {
    expect(validateStudyDraft(closedCardSortingDraft)).toEqual({
      valid: true,
      errors: [],
    })
  })

  it('accepts open and hybrid Card Sorting modes', () => {
    expect(validateStudyDraft(openCardSortingDraft).valid).toBe(true)
    expect(validateStudyDraft(hybridCardSortingDraft).valid).toBe(true)
  })

  it('rejects closed Card Sorting without categories', () => {
    const invalid = {
      ...closedCardSortingDraft,
      testStructure: {
        ...closedCardSortingDraft.testStructure,
        cardSorting: {
          ...closedCardSortingDraft.testStructure.cardSorting,
          categories: [],
        },
      },
    }
    const result = validateStudyDraft(invalid)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('category'))).toBe(true)
  })

  it('validates User, Heuristic and Focus Group drafts', () => {
    expect(validateStudyDraft(userTestDraft).valid).toBe(true)
    expect(validateStudyDraft(heuristicDraft).valid).toBe(true)
    expect(validateStudyDraft(focusGroupDraft).valid).toBe(true)
  })

  it('allows clarification drafts without full method content', () => {
    expect(validateStudyDraft(clarificationDraft).valid).toBe(true)
  })
})

describe('mapDraftToStudyRawData', () => {
  it('removes clarification fields and injects StudyAdmin', () => {
    const raw = mapDraftToStudyRawData(closedCardSortingDraft, user)

    expect(raw.clarificationNeeded).toBeUndefined()
    expect(raw.clarificationQuestions).toBeUndefined()
    expect(raw.id).toBeNull()
    expect(raw.templateDoc).toBeNull()
    expect(raw.cooperators).toEqual([])
    expect(raw.testAdmin.userDocId).toBe('user-1')
    expect(raw.testAdmin.email).toBe('user@example.com')
    expect(raw.creationDate).toEqual(expect.any(Number))
  })

  it('produces Card Sorting toFirestore shape matching template pipeline', () => {
    const raw = mapDraftToStudyRawData(closedCardSortingDraft, user)
    const study = instantiateStudyByType(raw.testType, raw)
    const firestore = study.toFirestore()

    expect(firestore.testType).toBe('CARD_SORTING')
    expect(firestore.testTitle).toBe('Organização da casa')
    expect(firestore.testStructure.cardSorting.cards).toEqual([
      { title: 'TV', description: '' },
      { title: 'Pia', description: '' },
    ])
    expect(firestore.testStructure.cardSorting.categories).toEqual([
      { title: 'Sala', description: '' },
      { title: 'Cozinha', description: '' },
    ])
    expect(
      firestore.testStructure.cardSorting.options.allow_create_categories,
    ).toBe(false)
    expect(firestore.testAdmin.userDocId).toBe('user-1')
    expect(firestore).not.toHaveProperty('clarificationNeeded')
  })

  it('maps Focus Group discussionGuide and config', () => {
    const raw = mapDraftToStudyRawData(focusGroupDraft, user)
    const study = instantiateStudyByType(raw.testType, raw)
    const firestore = study.toFirestore()

    expect(firestore.discussionGuide).toHaveLength(1)
    expect(firestore.config.maxParticipants).toBe(8)
  })
})
