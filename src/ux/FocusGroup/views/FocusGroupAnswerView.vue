<template>
  <PageWrapper :title="$t('focusGroup.answers.title')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('focusGroup.answers.subtitle') }}
      </p>
    </template>

    <v-container class="pa-0">
      <div
        v-if="!loading && !sessions.length"
        class="text-center py-12 text-medium-emphasis"
      >
        <v-avatar color="primary" variant="tonal" size="64" class="mb-3">
          <v-icon icon="mdi-history" size="32" />
        </v-avatar>
        <p class="text-body-2 mb-0">{{ $t('focusGroup.answers.empty') }}</p>
      </div>

      <div v-else>
        <!-- Session picker: a compact horizontal row, not a dedicated sidebar
             column — a session list is rarely more than a handful of items,
             so giving it a permanent third of the page wastes space that the
             actual content (what people said) needs more. -->
        <div
          v-if="sessions.length > 1"
          class="d-flex ga-2 mb-5 overflow-x-auto pb-1"
        >
          <v-chip
            v-for="session in sessions"
            :key="session.sessionId"
            :color="session.sessionId === selectedSessionId ? 'primary' : undefined"
            :variant="session.sessionId === selectedSessionId ? 'flat' : 'outlined'"
            size="large"
            class="text-none flex-shrink-0"
            @click="selectedSessionId = session.sessionId"
          >
            <v-icon start size="16">mdi-calendar-clock-outline</v-icon>
            {{ formatDate(session.startedAt) }}
            <v-chip size="x-small" variant="flat" color="grey-lighten-2" class="ml-2">
              {{ participantCount(session) }}
            </v-chip>
          </v-chip>
        </div>
        <div
          v-else-if="selectedSession"
          class="d-flex align-center ga-2 mb-5 text-medium-emphasis"
        >
          <v-icon icon="mdi-calendar-clock-outline" size="18" />
          <span class="text-body-2">
            {{ formatDate(selectedSession.startedAt) }}
            <span class="mx-1">•</span>
            {{
              $t('focusGroup.answers.participantCount', {
                count: participantCount(selectedSession),
              })
            }}
          </span>
        </div>

        <template v-if="selectedSession">
          <v-card
            v-for="topic in topics"
            :key="topic.id"
            variant="outlined"
            rounded="lg"
            class="mb-4"
          >
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-forum-outline" color="primary" size="20" />
              <span>{{ topic.title || $t('focusGroup.modules.untitledTopic') }}</span>
              <v-spacer />
              <v-chip size="small" variant="tonal">
                {{
                  topicMessageGroups(topic.id).reduce(
                    (sum, group) => sum + group.messages.length,
                    0,
                  )
                }}
              </v-chip>
            </v-card-title>
            <v-divider />
            <v-card-text>
              <div
                v-for="group in topicMessageGroups(topic.id)"
                :key="group.promptText || 'open-discussion'"
                class="mb-4"
              >
                <!-- A topic can carry several prompts; grouping keeps each
                     prompt's responses together instead of one flat stream. -->
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon
                    :icon="
                      group.promptText
                        ? 'mdi-help-circle-outline'
                        : 'mdi-forum-outline'
                    "
                    size="16"
                    :color="group.promptText ? 'primary' : 'medium-emphasis'"
                  />
                  <span
                    class="text-caption font-weight-medium"
                    :class="group.promptText ? 'text-primary' : 'text-medium-emphasis'"
                  >
                    {{ group.promptText || $t('focusGroup.answers.openDiscussion') }}
                  </span>
                </div>

                <div
                  v-for="message in group.messages"
                  :key="message.id"
                  class="d-flex ga-3 mb-3"
                >
                  <v-avatar
                    :color="isFacilitatorMessage(message) ? 'secondary' : 'primary'"
                    variant="tonal"
                    size="32"
                  >
                    <span class="text-caption font-weight-medium">
                      {{ initial(message.name) }}
                    </span>
                  </v-avatar>
                  <div class="flex-grow-1 min-width-0">
                    <div class="d-flex align-center ga-2 text-caption text-medium-emphasis mb-1">
                      <span>{{ message.name || $t('focusGroup.session.anonymous') }}</span>
                      <v-chip
                        v-if="isFacilitatorMessage(message)"
                        size="x-small"
                        variant="tonal"
                        color="secondary"
                      >
                        {{ $t('focusGroup.answers.facilitatorBadge') }}
                      </v-chip>
                    </div>
                    <div
                      class="px-3 py-2 rounded-lg text-body-2"
                      :class="
                        isFacilitatorMessage(message)
                          ? 'bg-blue-grey-lighten-5'
                          : 'bg-grey-lighten-4'
                      "
                    >
                      {{ message.text }}
                    </div>
                  </div>
                </div>
              </div>
              <p
                v-if="!topicMessageGroups(topic.id).length"
                class="text-medium-emphasis text-center my-4 mb-0"
              >
                {{ $t('focusGroup.session.noMessagesYet') }}
              </p>
            </v-card-text>
          </v-card>

          <v-card
            v-if="observerNoteEntries.length"
            variant="outlined"
            rounded="lg"
            class="mb-4"
          >
            <v-card-title class="d-flex align-center ga-2">
              <v-icon
                icon="mdi-notebook-edit-outline"
                color="primary"
                size="20"
              />
              <span>{{ $t('focusGroup.answers.observerNotesTitle') }}</span>
            </v-card-title>
            <v-divider />
            <v-card-text>
              <div
                v-for="entry in observerNoteEntries"
                :key="entry.userId"
                class="mb-3"
              >
                <div
                  v-for="(note, index) in entry.notes"
                  :key="index"
                  class="d-flex ga-2 mb-2"
                >
                  <v-icon
                    icon="mdi-note-text-outline"
                    size="16"
                    color="medium-emphasis"
                    class="mt-1"
                  />
                  <span class="text-body-2">{{ note.text }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card
            v-if="recordingEntries.length"
            variant="outlined"
            rounded="lg"
            class="mb-4"
          >
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-play-circle-outline" color="primary" size="20" />
              <span>{{ $t('focusGroup.answers.recordingsTitle') }}</span>
            </v-card-title>
            <v-divider />
            <v-list density="compact">
              <v-list-item
                v-for="recording in recordingEntries"
                :key="`${recording.userId}-${recording.topicId}`"
                :href="recording.url"
                target="_blank"
                rel="noopener"
                rounded="lg"
              >
                <template #prepend>
                  <v-icon
                    :icon="
                      recording.kind === 'audio'
                        ? 'mdi-microphone'
                        : 'mdi-video-outline'
                    "
                    size="18"
                  />
                </template>
                <v-list-item-title>
                  {{
                    $t('focusGroup.answers.recordingLabel', {
                      topic: recording.topicId,
                      kind: recording.kind,
                    })
                  }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card variant="outlined" rounded="lg">
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-shape-outline" color="primary" size="20" />
              <span>{{ $t('focusGroup.answers.themesTitle') }}</span>
            </v-card-title>
            <v-card-subtitle>
              {{ $t('focusGroup.answers.themesHint') }}
            </v-card-subtitle>
            <v-divider class="mt-2" />
            <v-card-text>
              <ThematicEditor v-model="themes" :session="selectedSession" />
            </v-card-text>
          </v-card>
        </template>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ThematicEditor from '@/ux/FocusGroup/components/ThematicEditor.vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import {
  sortSessionsByStartedAt,
  groupTopicMessagesByPrompt,
} from '@/ux/FocusGroup/utils/sessionSummary'

const store = useStore()
const route = useRoute()
const router = useRouter()

const test = computed(() => store.getters.test)
const user = computed(() => store.getters.user)

// Session answers — the participants' own words, observer notes, and themes
// derived from them — are for the people running or watching the study, not
// the participants themselves (and not an unrelated signed-in stranger,
// even on a public study). An explicit allow-list, not "not a participant",
// so anyone with no real relationship to the study is denied by default.
// Hiding the "Answers" sidebar item (ManagerView's navigator) is a UX
// nicety, not the boundary — this redirect is, since the URL is still
// reachable directly.
const accessLevel = computed(() => {
  const currentUser = user.value
  const currentTest = test.value
  if (!currentUser || !currentTest) return null
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest.testAdmin?.userDocId === currentUser.id)
    return ACCESS_LEVEL.ADMIN
  const coop = currentTest.cooperators?.find(
    (c) => c.userDocId === currentUser.id,
  )
  return coop?.accepted === true ? coop.accessLevel : null
})
const isFacilitator = computed(() => accessLevel.value === ACCESS_LEVEL.ADMIN)
const isObserver = computed(
  () => accessLevel.value === ACCESS_LEVEL.OBSERVATOR,
)
watch(
  [test, user],
  () => {
    if (!test.value || !user.value) return
    if (!isFacilitator.value && !isObserver.value) {
      store.commit('SET_TOAST', {
        message: 'AccessNotAllowed.noAccess',
        type: 'error',
      })
      router.replace(`/focusGroup/dashboard/${test.value.id}`)
    }
  },
  { immediate: true },
)
const rawSessions = ref({})
const themes = ref([])
const loading = ref(true)
const selectedSessionId = ref(null)
let themesLoaded = false

const sessions = computed(() => sortSessionsByStartedAt(rawSessions.value))
const selectedSession = computed(
  () => sessions.value.find((s) => s.sessionId === selectedSessionId.value) ?? null,
)
const topics = computed(() =>
  Array.isArray(test.value?.discussionGuide) ? test.value.discussionGuide : [],
)

const participantCount = (session) =>
  Object.keys(session.participants ?? {}).length

const formatDate = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleString() : ''

const initial = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?')

// The facilitator's own chat (prompts, transitions, acknowledgments) stays in
// the transcript for context, but it isn't participant response data — mark
// it distinctly rather than blending it in. It's also excluded entirely from
// the theme board, where it would just be noise (see flattenSessionResponses).
const isFacilitatorMessage = (message) =>
  !!selectedSession.value?.facilitatorId &&
  message?.userId === selectedSession.value.facilitatorId

const topicMessageGroups = (topicId) =>
  groupTopicMessagesByPrompt(selectedSession.value?.messages, topicId)

// notes: { [userId]: [{ text, timestamp, topicId }] }
const observerNoteEntries = computed(() =>
  Object.entries(selectedSession.value?.notes ?? {})
    .filter(([, notes]) => Array.isArray(notes) && notes.length)
    .map(([userId, notes]) => ({ userId, notes })),
)

// recordings: { [userId]: { [topicId]: { url, kind, sizeBytes, recordedAt } } }
// Present only once the recording feature is also in place — rendered
// defensively so this view works with or without it.
const recordingEntries = computed(() => {
  const recordings = selectedSession.value?.recordings ?? {}
  const entries = []
  Object.entries(recordings).forEach(([userId, byTopic]) => {
    Object.entries(byTopic ?? {}).forEach(([topicId, recording]) => {
      if (recording?.url) {
        entries.push({ userId, topicId, url: recording.url, kind: recording.kind })
      }
    })
  })
  return entries
})

// Persist the theme board immediately on every drag-and-drop change, the
// same "no Save button" pattern used elsewhere (stimulus library, breakout
// state) — skipped for the initial load, which isn't a user edit.
watch(themes, (nextThemes) => {
  if (!themesLoaded) return
  store.dispatch('saveFocusGroupThemes', {
    answersDocId: test.value?.answersDocId,
    themes: nextThemes,
  })
})

onMounted(async () => {
  if (!test.value) await store.dispatch('getStudy', { id: route.params.id })
  try {
    const answer = await store.dispatch(
      'getFocusGroupSessionAnswers',
      test.value?.answersDocId,
    )
    rawSessions.value = answer.sessions
    themes.value = answer.themes
    themesLoaded = true
    const first = sortSessionsByStartedAt(rawSessions.value)[0]
    selectedSessionId.value = first?.sessionId ?? null
  } finally {
    loading.value = false
  }
})
</script>
