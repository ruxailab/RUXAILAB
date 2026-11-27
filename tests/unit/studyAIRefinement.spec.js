import { flushPromises, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'
import CreateWithAIView from '@/features/ux_creation/CreateWithAIView.vue'
import StudyAIChat from '@/features/ux_creation/components/StudyAIChat.vue'
import StudyAIPreview from '@/features/ux_creation/components/StudyAIPreview.vue'
import { generateStudyDraft } from '@/ai/study-generation/StudyGenerationService'
import {
  buildStudyDraftRequest,
  summarizeDraftChanges,
} from '@/ai/study-generation/refinement'
import {
  clarificationDraft,
  closedCardSortingDraft,
} from '@/ai/study-generation/fixtures/studyDrafts'
import en from '@/app/plugins/locales/en.json'
import es from '@/app/plugins/locales/es.json'

jest.mock('@/ai/study-generation/StudyGenerationService', () => ({
  generateStudyDraft: jest.fn(),
}))
jest.mock('@/shared/utils/toast', () => ({ showError: jest.fn() }))
jest.mock('vue-router', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock('vuetify', () => ({
  useDisplay: () => ({ mdAndUp: jest.requireActual('vue').ref(true) }),
}))

const createI18nFor = (locale) =>
  createI18n({ legacy: false, locale, messages: { en, es } })

const i18nFor = (locale) => ({ t: createI18nFor(locale).global.t, locale })

const cardsChange = (overrides = {}) => ({
  section: 'cards',
  kind: 'list',
  added: [],
  removed: [],
  updated: [],
  reordered: false,
  ...overrides,
})

const handEditedDraft = {
  ...closedCardSortingDraft,
  testTitle: 'My own title',
}

describe('buildStudyDraftRequest', () => {
  const request = (currentDraft) =>
    buildStudyDraftRequest({
      messages: [{ role: 'user', text: 'Add a card' }],
      locale: 'en',
      preferredMethod: null,
      currentDraft,
    })

  it('sends a complete draft, hand edits included, as currentDraft', () => {
    expect(request(handEditedDraft).currentDraft).toEqual(handEditedDraft)
  })

  it.each([
    ['no draft', null],
    ['a clarification draft', clarificationDraft],
  ])('omits currentDraft when there is %s', (_label, draft) => {
    expect(request(draft)).not.toHaveProperty('currentDraft')
  })
})

describe('summarizeDraftChanges', () => {
  it('lists each changed section in English', () => {
    const summary = summarizeDraftChanges(
      [
        { section: 'welcomeMessage', kind: 'value' },
        cardsChange({
          added: ['Sofa', 'Lamp'],
          removed: ['TV'],
          reordered: true,
        }),
      ],
      i18nFor('en'),
    )

    expect(summary).toBe(
      [
        'I updated the study:',
        '- Welcome message: updated',
        '- Cards: added "Sofa" and "Lamp"; removed "TV"; reordered',
      ].join('\n'),
    )
  })

  it('localizes the summary and shortens long lists', () => {
    const added = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

    expect(summarizeDraftChanges([cardsChange({ added })], i18nFor('es'))).toBe(
      [
        'He actualizado el estudio:',
        '- Tarjetas: añadido "A", "B", "C", "D", "E" y 2 más',
      ].join('\n'),
    )
  })

  it('says nothing changed when the change list is empty', () => {
    expect(summarizeDraftChanges([], i18nFor('en'))).toBe(
      en.studyCreation.ai.refinement.noChanges,
    )
  })
})

describe('CreateWithAIView refinement flow', () => {
  const respondWith = (draft, changes) =>
    generateStudyDraft.mockResolvedValueOnce({ draft, changes })

  const mountView = () =>
    shallowMount(CreateWithAIView, {
      global: {
        plugins: [
          createI18nFor('en'),
          createStore({
            state: { Tests: {} },
            mutations: { SET_AI_STUDY_DRAFT() {} },
          }),
        ],
        stubs: Object.fromEntries(
          ['VContainer', 'VRow', 'VCol', 'VTabs', 'VTab', 'VBtn'].map(
            (name) => [name, { template: '<div><slot /></div>' }],
          ),
        ),
      },
    })

  const send = async (wrapper, text) => {
    wrapper.findComponent(StudyAIChat).vm.$emit('send', text)
    await flushPromises()
  }

  const lastReply = (wrapper) =>
    wrapper.findComponent(StudyAIChat).props('messages').at(-1).text

  const lastRequest = () => generateStudyDraft.mock.calls.at(-1)[0]

  const preview = (wrapper) => wrapper.findComponent(StudyAIPreview)

  it('asks clarification questions before the first draft, without a preview', async () => {
    const wrapper = mountView()
    respondWith(clarificationDraft)

    await send(wrapper, 'Create a user test')

    expect(lastRequest()).not.toHaveProperty('currentDraft')
    expect(lastReply(wrapper)).toBe(
      clarificationDraft.clarificationQuestions.join('\n\n'),
    )
    expect(preview(wrapper).exists()).toBe(false)
  })

  it('shows the preview beside the chat and refines it with hand edits kept', async () => {
    const wrapper = mountView()
    respondWith(closedCardSortingDraft)
    await send(wrapper, 'Create a closed card sort')

    expect(wrapper.findComponent(StudyAIChat).exists()).toBe(true)
    expect(preview(wrapper).props('draft')).toEqual(closedCardSortingDraft)
    expect(lastReply(wrapper)).toBe(en.studyCreation.ai.completedToPreview)

    preview(wrapper).vm.$emit('update:draft', handEditedDraft)
    const refined = { ...handEditedDraft, testDescription: 'Updated' }
    respondWith(refined, [{ section: 'testDescription', kind: 'value' }])
    await send(wrapper, 'Change the description')

    expect(lastRequest().currentDraft).toEqual(handEditedDraft)
    expect(preview(wrapper).props('draft')).toEqual(refined)
    expect(lastReply(wrapper)).toBe(
      'I updated the study:\n- Description: updated',
    )
  })

  it('keeps the current draft when a refinement needs clarification', async () => {
    const wrapper = mountView()
    respondWith(closedCardSortingDraft)
    await send(wrapper, 'Create a closed card sort')

    respondWith({
      ...clarificationDraft,
      clarificationQuestions: ['Which card?'],
    })
    await send(wrapper, 'Remove the card')

    expect(preview(wrapper).props('draft')).toEqual(closedCardSortingDraft)
    expect(lastReply(wrapper)).toBe('Which card?')
  })
})
