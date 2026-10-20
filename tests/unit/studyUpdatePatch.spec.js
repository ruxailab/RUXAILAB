import {
  applyStudyUpdatePatch,
  createStudyUpdatePatch,
  mergeStudySnapshotPreservingFields,
  mergeStudySnapshotPreservingRootFields,
} from '@/shared/utils/studyUpdatePatch'

describe('study update patches', () => {
  it('applies a stale editor change without reverting another saved section', () => {
    const staleStudy = {
      testTitle: 'Study',
      testStructure: {
        userTasks: [{ taskName: 'Original task' }],
        postTest: [],
      },
    }
    const firstAdminUpdate = {
      ...staleStudy,
      testStructure: {
        ...staleStudy.testStructure,
        userTasks: [{ taskName: 'New task' }],
      },
    }
    const secondAdminUpdate = {
      ...staleStudy,
      testStructure: {
        ...staleStudy.testStructure,
        postTest: [{ title: 'New question' }],
      },
    }

    const firstPatch = createStudyUpdatePatch(staleStudy, firstAdminUpdate)
    const secondPatch = createStudyUpdatePatch(staleStudy, secondAdminUpdate)
    const latestStudy = applyStudyUpdatePatch(staleStudy, firstPatch)
    const mergedStudy = applyStudyUpdatePatch(latestStudy, secondPatch)

    expect(secondPatch).toEqual([
      {
        path: ['testStructure', 'postTest'],
        value: [{ title: 'New question' }],
      },
    ])
    expect(mergedStudy.testStructure).toEqual({
      userTasks: [{ taskName: 'New task' }],
      postTest: [{ title: 'New question' }],
    })
  })

  it('preserves concurrent nested map entries while changing one leaf', () => {
    const staleStudy = {
      testStructure: {
        cardSorting: {
          cards: [{ title: 'Card' }],
          categories: [{ title: 'Old category' }],
        },
      },
    }
    const currentStudy = applyStudyUpdatePatch(staleStudy, [
      {
        path: ['testStructure', 'cardSorting', 'categories'],
        value: [{ title: 'New category' }],
      },
    ])
    const editorStudy = {
      testStructure: {
        cardSorting: {
          cards: [{ title: 'Updated card' }],
          categories: [{ title: 'Old category' }],
        },
      },
    }
    const editorPatch = createStudyUpdatePatch(staleStudy, editorStudy)

    expect(
      applyStudyUpdatePatch(currentStudy, editorPatch).testStructure
        .cardSorting,
    ).toEqual({
      cards: [{ title: 'Updated card' }],
      categories: [{ title: 'New category' }],
    })
  })

  it('preserves heuristics when another editor changes answer options', () => {
    const staleStudy = {
      testStructure: [{ id: 1, title: 'Visibility' }],
      testOptions: [{ text: 'Poor', value: 1 }],
    }
    const optionsEditor = {
      ...staleStudy,
      testOptions: [
        { text: 'Poor', value: 1 },
        { text: 'Good', value: 2 },
      ],
    }
    const heuristicsEditor = {
      ...staleStudy,
      testStructure: [
        { id: 1, title: 'Visibility' },
        { id: 2, title: 'Feedback' },
      ],
    }
    const optionsPatch = createStudyUpdatePatch(staleStudy, optionsEditor)
    const heuristicsPatch = createStudyUpdatePatch(staleStudy, heuristicsEditor)
    const afterOptions = applyStudyUpdatePatch(staleStudy, optionsPatch)

    expect(applyStudyUpdatePatch(afterOptions, heuristicsPatch)).toEqual({
      testStructure: [
        { id: 1, title: 'Visibility' },
        { id: 2, title: 'Feedback' },
      ],
      testOptions: [
        { text: 'Poor', value: 1 },
        { text: 'Good', value: 2 },
      ],
    })
  })

  it('represents deleted fields explicitly', () => {
    expect(
      createStudyUpdatePatch(
        { testStructure: { obsolete: true, retained: true } },
        { testStructure: { retained: true } },
      ),
    ).toEqual([
      { path: ['testStructure', 'obsolete'], delete: true },
    ])
  })

  it('keeps locally edited pre-test questions and applies the remote post-test questions', () => {
    const localStudy = {
      testStructure: {
        preTest: [{ title: 'Unsaved pre-test question' }],
        postTest: [],
      },
    }
    const remoteStudy = {
      testStructure: {
        preTest: [],
        postTest: [{ title: 'Saved post-test question' }],
      },
    }

    expect(
      mergeStudySnapshotPreservingFields(localStudy, remoteStudy, [
        'preTest',
      ]),
    ).toEqual({
      testStructure: {
        preTest: [{ title: 'Unsaved pre-test question' }],
        postTest: [{ title: 'Saved post-test question' }],
      },
    })
  })

  it('applies remote option changes while preserving locally edited heuristics', () => {
    const currentStudy = {
      testStructure: [{ id: 1, title: 'Local unsaved heuristic' }],
      testOptions: [{ text: 'Old option', value: 1 }],
    }
    const incomingStudy = {
      testStructure: [{ id: 1, title: 'Remote older heuristic' }],
      testOptions: [
        { text: 'Old option', value: 1 },
        { text: 'New remote option', value: 2 },
      ],
    }

    expect(
      mergeStudySnapshotPreservingRootFields(currentStudy, incomingStudy, [
        'testStructure',
      ]),
    ).toEqual({
      testStructure: [{ id: 1, title: 'Local unsaved heuristic' }],
      testOptions: [
        { text: 'Old option', value: 1 },
        { text: 'New remote option', value: 2 },
      ],
    })
  })
})
