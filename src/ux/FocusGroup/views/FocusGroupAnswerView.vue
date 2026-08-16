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
        class="text-center py-8 text-medium-emphasis"
      >
        <v-icon icon="mdi-history" size="48" class="mb-2" />
        <p class="text-body-2 mb-0">{{ $t('focusGroup.answers.empty') }}</p>
      </div>

      <v-row v-else>
        <v-col cols="12" md="4">
          <v-list density="compact" class="pa-0">
            <v-list-item
              v-for="session in sessions"
              :key="session.sessionId"
              :active="session.sessionId === selectedSessionId"
              rounded="lg"
              class="mb-1"
              @click="selectedSessionId = session.sessionId"
            >
              <v-list-item-title>
                {{ formatDate(session.startedAt) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{
                  $t('focusGroup.answers.participantCount', {
                    count: participantCount(session),
                  })
                }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col v-if="selectedSession" cols="12" md="8">
          <v-card
            v-for="topic in topics"
            :key="topic.id"
            variant="outlined"
            rounded="lg"
            class="mb-4"
          >
            <v-card-title>{{ topic.title || $t('focusGroup.modules.untitledTopic') }}</v-card-title>
            <v-card-text>
              <div
                v-for="message in flattenTopicMessages(selectedSession.messages, topic.id)"
                :key="message.id"
                class="mb-2"
              >
                <strong>{{ message.name || $t('focusGroup.session.anonymous') }}:</strong>
                {{ message.text }}
              </div>
              <p
                v-if="!flattenTopicMessages(selectedSession.messages, topic.id).length"
                class="text-medium-emphasis mb-0"
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
            <v-card-title>{{ $t('focusGroup.answers.observerNotesTitle') }}</v-card-title>
            <v-card-text>
              <div
                v-for="entry in observerNoteEntries"
                :key="entry.userId"
                class="mb-3"
              >
                <div
                  v-for="(note, index) in entry.notes"
                  :key="index"
                  class="text-body-2 mb-1"
                >
                  {{ note.text }}
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card
            v-if="recordingEntries.length"
            variant="outlined"
            rounded="lg"
          >
            <v-card-title>{{ $t('focusGroup.answers.recordingsTitle') }}</v-card-title>
            <v-list density="compact">
              <v-list-item
                v-for="recording in recordingEntries"
                :key="`${recording.userId}-${recording.topicId}`"
                :href="recording.url"
                target="_blank"
                rel="noopener"
              >
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
        </v-col>
      </v-row>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import {
  sortSessionsByStartedAt,
  flattenTopicMessages,
} from '@/ux/FocusGroup/utils/sessionSummary'

const store = useStore()
const route = useRoute()

const test = computed(() => store.getters.test)
const rawSessions = ref({})
const loading = ref(true)
const selectedSessionId = ref(null)

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

onMounted(async () => {
  if (!test.value) await store.dispatch('getStudy', { id: route.params.id })
  try {
    rawSessions.value = await store.dispatch(
      'getFocusGroupSessionAnswers',
      test.value?.answersDocId,
    )
    const first = sortSessionsByStartedAt(rawSessions.value)[0]
    selectedSessionId.value = first?.sessionId ?? null
  } finally {
    loading.value = false
  }
})
</script>
