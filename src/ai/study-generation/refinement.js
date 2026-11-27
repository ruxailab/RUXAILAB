const MAX_LISTED_ITEMS = 5

export function isCompleteDraft(draft) {
  return !!draft && !draft.clarificationNeeded
}

/**
 * Builds the generateStudyDraft payload. A complete draft, hand edits
 * included, is sent as currentDraft so the agent refines it.
 *
 * @param {{
 *   messages: Array<{ role: 'user' | 'model', text: string }>,
 *   locale: string,
 *   preferredMethod: string | null,
 *   currentDraft?: object | null,
 * }} params
 */
export function buildStudyDraftRequest({
  messages,
  locale,
  preferredMethod,
  currentDraft = null,
}) {
  const payload = { messages: [...messages], locale, preferredMethod }
  if (isCompleteDraft(currentDraft)) {
    payload.currentDraft = JSON.parse(JSON.stringify(currentDraft))
  }
  return payload
}

function formatItems(items, { t, locale }) {
  const shown = items.slice(0, MAX_LISTED_ITEMS).map((item) => `"${item}"`)
  const hidden = items.length - shown.length
  if (hidden > 0) {
    shown.push(t('studyCreation.ai.refinement.more', { count: hidden }))
  }
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format(shown)
}

function describeChange(change, i18n) {
  const { t } = i18n
  if (change.kind !== 'list') return t('studyCreation.ai.refinement.updated')

  const parts = ['added', 'removed', 'updated']
    .filter((operation) => change[operation]?.length)
    .map((operation) =>
      t(`studyCreation.ai.refinement.items.${operation}`, {
        items: formatItems(change[operation], i18n),
      }),
    )
  if (change.reordered) parts.push(t('studyCreation.ai.refinement.reordered'))
  return parts.join('; ')
}

/**
 * Turns the change list returned by generateStudyDraft into a chat message.
 * When nothing changed, the model's own message (often an answer) is shown.
 *
 * @param {Array<object>|undefined} changes
 * @param {{ t: Function, locale: string }} i18n
 * @param {string} [modelMessage]
 * @returns {string}
 */
export function summarizeDraftChanges(changes, i18n, modelMessage = '') {
  const { t } = i18n
  if (!changes?.length) {
    return [
      t('studyCreation.ai.refinement.noChanges'),
      modelMessage || t('studyCreation.ai.refinement.noChangesHint'),
    ].join('\n\n')
  }

  const lines = changes.map((change) => {
    const sectionKey = `studyCreation.ai.refinement.sections.${change.section}`
    return `- ${t(sectionKey)}: ${describeChange(change, i18n)}`
  })
  return [t('studyCreation.ai.refinement.summaryTitle'), ...lines].join('\n')
}
