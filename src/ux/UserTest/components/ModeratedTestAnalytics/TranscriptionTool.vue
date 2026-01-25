<template>
  <div class="bg-background pa-4">
    <div v-if="isUserStudy">
      <div v-if="isModerated">
        <!-- DEBUG -->
        <!-- selectedUserID: {{ selectedUserID }} <br />
        selectedTask: {{ selectedTask }} <br />
        selectedTaskId: {{ selectedTaskId }} <br />
        tasksForSelectedUser: {{ tasksForSelectedUser }} -->

        <!-- Top controls (replaces left columns) -->
        <v-row class="mb-2" no-gutters>
          <v-col cols="12" md="4" class="pr-md-2 mb-2 mb-md-0">
            <v-select
              v-model="selectedUserID"
              :items="userOptions"
              item-title="label"
              item-value="value"
              label="Evaluator"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              :menu-props="{ maxHeight: 320 }"
              clearable
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item?.raw?.label"
                  :subtitle="item?.raw?.subtitle"
                />
              </template>
              <template #selection="{ item }">
                <span>{{ item?.raw?.label }}</span>
                <!-- <span
                  v-if="item?.raw?.subtitle"
                  class="text-caption text-medium-emphasis"
                >
                  &nbsp;•&nbsp;{{ item.raw.subtitle }}
                </span> -->
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="4" class="pr-md-2 mb-2 mb-md-0">
            <v-select
              v-model="selectedTaskId"
              :items="taskOptions"
              item-title="label"
              item-value="value"
              label="Task"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-clipboard-list-outline"
              :disabled="!selectedUserID"
              :menu-props="{ maxHeight: 320 }"
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item?.raw?.label"
                  :subtitle="item?.raw?.subtitle"
                />
              </template>
              <template #selection="{ item }">
                <span>{{ item?.raw?.label }}</span>
                <span
                  v-if="item?.raw?.subtitle"
                  class="text-caption text-medium-emphasis"
                >
                  &nbsp;•&nbsp;{{ item.raw.subtitle }}
                </span>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <v-row class="ma-0">
          <v-col cols="12">
            <div v-if="selectedTask">
              <v-tabs
                v-model="tab"
                bg-color="transparent"
                color="#FCA326"
                class="mb-3"
                grow
              >
                <v-tab value="timeline">Timeline</v-tab>
                <v-tab value="transcriptions">Transcriptions</v-tab>
                <v-tab value="export">Export Data</v-tab>
              </v-tabs>

              <div class="panel-shell">
                <TimelinePanel
                  v-if="tab === 'timeline'"
                  :key="`timeline-${selectedUserID}:${selectedTaskId}`"
                  :answers-doc-id="testDocument?.answersDocId"
                  :user-doc-id="selectedUserID"
                  :task-id="selectedTaskId"
                  :audio-url-evaluator="selectedTask?.audioRecordURL"
                  :audio-url-moderator="selectedTask?.moderatorAudioURL"
                />

                <TranscriptionsPanel
                  v-else-if="tab === 'transcriptions'"
                  :key="`transcriptions-${selectedUserID}:${selectedTaskId}`"
                  :answers-doc-id="testDocument?.answersDocId"
                  :user-doc-id="selectedUserID"
                  :task-id="selectedTaskId"
                  :latest-transcription-id="
                    selectedTask?.latestTranscriptionDocId
                  "
                />

                <ExportPanel
                  v-else
                  :key="`export-${selectedUserID}:${selectedTaskId}`"
                  :answers-doc-id="testDocument?.answersDocId"
                  :user-doc-id="selectedUserID"
                  :task-id="selectedTaskId"
                />
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- <v-row class="ma-0">
          <div v-if="selectedTask">
            <v-tabs v-model="tab" bg-color="transparent" color="#FCA326">
              <v-tab value="timeline">Timeline</v-tab>
              <v-tab value="transcriptions">Transcriptions</v-tab>
              <v-tab value="export">Export Data</v-tab>
            </v-tabs>

            <div style="background-color: #e8eaf2" class="ma-0 pa-0">
              <TimelinePanel
                v-if="tab === 'timeline'"
                :key="`${selectedUserID}:${selectedTaskId}`"
                :answers-doc-id="testDocument?.answersDocId"
                :user-doc-id="selectedUserID"
                :task-id="selectedTaskId"
                :audio-url-evaluator="selectedTask?.audioRecordURL"
                :audio-url-moderator="selectedTask?.moderatorAudioURL"
              />
              <TranscriptionsPanel
                v-if="tab === 'transcriptions'"
                :key="`${selectedUserID}:${selectedTaskId}`"
                :answers-doc-id="testDocument?.answersDocId"
                :user-doc-id="selectedUserID"
                :task-id="selectedTaskId"
                :latestTranscriptionId="selectedTask?.latestTranscriptionDocId"
              />
              <ExportPanel
                v-if="tab === 'export'"
                :key="`${selectedUserID}:${selectedTaskId}`"
                :answers-doc-id="testDocument?.answersDocId"
                :user-doc-id="selectedUserID"
                :task-id="selectedTaskId"
              />
            </div>
          </div>
        </v-row> -->
      </div>
    </div>
    <!-- 
    <div v-else>
      <h6>Sorry Studies isn't available for Heuristic tests</h6>
    </div> -->
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { useStore } from 'vuex'

import TimelinePanel from '@/ux/UserTest/components/transcription/TimeLinePanel.vue'
import TranscriptionsPanel from '@/ux/UserTest/components/transcription/TranscriptionsPanel.vue'
import ExportPanel from '@/ux/UserTest/components/transcription/ExportPanel.vue'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'

const store = useStore()

const selectedUserID = ref(null)
const selectedTaskId = ref(null)
const tab = ref('timeline')

const testDocument = computed(() => store.getters.test)
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)
const usersID = computed(() => {
  return Object.values(testAnswerDocument.value.taskAnswers).map(
    (answer) => answer.userDocId,
  )
})
const selectedTask = computed(() => {
  const key = selectedTaskId.value
  if (key == null) return null
  const pair = tasksForSelectedUser.value.find(
    ([k]) => String(k) === String(key),
  )
  return pair ? pair[1] : null
})

// computed
const tasksForSelectedUser = computed(() => {
  const map = testAnswerDocument.value?.taskAnswers ?? {}
  const uid = selectedUserID.value
  const entry = uid ? map[uid] : null
  const tasks = entry?.tasks

  if (!tasks) return []

  // Normalize to [key, task] pairs for template
  if (Array.isArray(tasks)) {
    return tasks.map((t, i) => [String(i), t])
  }
  if (tasks instanceof Map) {
    return Array.from(tasks.entries()).map(([k, v]) => [String(k), v])
  }
  if (typeof tasks === 'object') {
    return Object.entries(tasks).map(([k, v]) => [String(k), v])
  }
  return []
})

// handy flags
const isUserStudy = computed(
  () => (testAnswerDocument.value?.type ?? null) === STUDY_TYPES.USER,
)
const isModerated = computed(
  () => (testDocument.value?.subType ?? null) === USER_STUDY_SUBTYPES.MODERATED,
)

/* options for selects */
const userOptions = computed(() => {
  const ids = usersID.value || []
  return ids.map((uid) => ({
    value: uid,
    label: getCooperatorEmail(uid) || uid,
    subtitle: uid, // optional: show raw uid under email
  }))
})

const taskOptions = computed(() => {
  const list = tasksForSelectedUser.value || [] // [ [key, task], ... ]
  return list.map(([key, task]) => ({
    value: String(key),
    label: `Task ${key}`,
    subtitle: `${task?.transcriptionsCount ?? 0} runs`,
  }))
})

/* auto-select the first user when list loads */
watch(
  usersID,
  (ids) => {
    if (!selectedUserID.value && Array.isArray(ids) && ids.length) {
      selectedUserID.value = ids[0]
    }
  },
  { immediate: true },
)

/* when user changes, pick first task for that user */
watch(
  tasksForSelectedUser,
  (pairs) => {
    const has = Array.isArray(pairs) && pairs.length
    if (!has) {
      selectedTaskId.value = null
      return
    }
    // if current taskId not in new list, reset to first
    const ok = pairs.some(([k]) => String(k) === String(selectedTaskId.value))
    if (!ok) selectedTaskId.value = String(pairs[0][0])
  },
  { immediate: true },
)

function getCooperatorEmail(userDocId) {
  let cooperatorEmail = null
  if (
    testDocument.value?.cooperators &&
    Array.isArray(testDocument.value.cooperators)
  ) {
    for (const element of testDocument.value.cooperators) {
      if (element && element.email && element.userDocId === userDocId) {
        cooperatorEmail = element.email
      }
    }
  }
  return cooperatorEmail
}
</script>

<style scoped>
.panel-shell {
  background: #e8eaf2;
  width: 100%; /* ✅ full width */
  padding: 0;
  border-radius: 0;
}
</style>
