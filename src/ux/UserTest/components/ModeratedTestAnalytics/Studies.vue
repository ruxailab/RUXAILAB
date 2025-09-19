<template>
  <div class="bg-background">
    <div v-if="isUserStudy">
      <div v-if="isModerated">
        <!-- DEBUG -->
        selectedUserID: {{ selectedUserID }} <br />
        selectedTask: {{ selectedTask }} <br />
        selectedTaskId: {{ selectedTaskId }} <br />
        tasksForSelectedUser: {{ tasksForSelectedUser }}

        <v-row class="ma-0">
          <!-- Users -->
          <v-col class="ma-0 pa-0 task-list" cols="3">
            <v-item-group v-model="selectedUserID">
              <v-item v-for="item in usersID" :key="item" :value="item">
                <template #default="{ isSelected, toggle }">
                  <v-list-item :active="isSelected" @click="toggle()">
                    <v-list-item-title>{{
                      getCooperatorEmail(item)
                    }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-item>
            </v-item-group>
          </v-col>

          <!-- Tasks for selected user -->
          <v-col class="ma-0 pa-0 task-list" cols="3">
            <v-item-group v-model="selectedTaskId">
              <v-item
                v-for="[key, task] in tasksForSelectedUser"
                :key="key"
                :value="key"
              >
                <template #default="{ isSelected, toggle }">
                  <v-list-item :active="isSelected" @click="toggle()">
                    <v-list-item-title>
                      {{ `Task ${key}` }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ task.transcriptionsCount ?? 0 }} runs
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-item>
            </v-item-group>
          </v-col>

          <!-- Tabs + content -->
          <div v-if="selectedTask">
            <!-- remove this v-if if you want tabs always visible -->
            <v-tabs v-model="tab" bg-color="transparent" color="#FCA326">
              <v-tab value="timeline">Timeline</v-tab>
              <v-tab value="transcriptions">Transcriptions</v-tab>
              <v-tab value="export">Export Data</v-tab>
            </v-tabs>

            <div style="background-color: #e8eaf2" class="ma-0 pa-0">
              <!-- <p v-if="tab === 'timeline'">Timeline Content</p> -->
              <!-- Added Key Prop So that it reloads when user/task changes -->
              <TimelinePanel
                v-if="tab === 'timeline'"
                :key="`${selectedUserID}:${selectedTaskId}`"
                :answer-doc-id="testDocument?.answersDocId"
                :user-doc-id="selectedUserID"
                :task-id="selectedTaskId"
                :audio-url-evaluator="selectedTask?.audioRecordURL"
                :audio-url-moderator="selectedTask?.moderatorAudioURL"
              />
              <!-- :transcription-id="selectedTask?.latestTranscriptionDocId" -->
              <TranscriptionsPanel
                v-if="tab === 'transcriptions'"
                :key="`${selectedUserID}:${selectedTaskId}`"
                :answer-doc-id="testDocument?.answersDocId"
                :user-doc-id="selectedUserID"
                :task-id="selectedTaskId"
                :latestTranscriptionId="selectedTask?.latestTranscriptionDocId"
              />
              <ExportPanel
                v-if="tab === 'export'"
                :key="`${selectedUserID}:${selectedTaskId}`"
                :answer-doc-id="testDocument?.answersDocId"
                :user-doc-id="selectedUserID"
                :task-id="selectedTaskId"
              />
            </div>
          </div>
        </v-row>
      </div>
      <div v-else>
        <h6>Sorry Studies isn't available for Un-moderated tests</h6>
      </div>
    </div>

    <div v-else>
      <h6>Sorry Studies isn't available for Heuristic tests</h6>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

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

// // auto-select first user
// watch(usersID, (ids) => {
//   if (!selectedUserID.value && ids.length) selectedUserID.value = ids[0]
// }, { immediate: true })

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

// // auto-select first task when user changes / tasks load
// watch(tasksForSelectedUser, (tasks) => {
//   if (tasks.length === 0) selectedTaskId.value = null
//   else if (selectedTaskId.value == null || selectedTaskId.value >= tasks.length) {
//     selectedTaskId.value = 0
//   }
// }, { immediate: true })

// handy flags
const isUserStudy = computed(
  () => (testAnswerDocument.value?.type ?? null) === STUDY_TYPES.USER,
)
const isModerated = computed(
  () => (testDocument.value?.subType ?? null) === USER_STUDY_SUBTYPES.MODERATED,
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
