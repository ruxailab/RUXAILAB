<template>
  <div>
    <div
      v-if="stimuli.length === 0"
      class="text-center py-8 text-medium-emphasis"
    >
      <v-icon icon="mdi-image-multiple-outline" size="48" class="mb-2" />
      <p class="text-body-2 mb-0">{{ $t('focusGroup.stimulus.empty') }}</p>
    </div>

    <v-card
      v-for="stimulus in stimuli"
      :key="stimulus.id"
      variant="outlined"
      rounded="lg"
      class="mb-3"
    >
      <v-card-text class="d-flex align-center ga-3 pa-4">
        <v-avatar v-if="stimulus.type === 'image'" size="48" rounded="lg">
          <v-img :src="stimulus.url" cover />
        </v-avatar>
        <v-avatar v-else size="48" rounded="lg" color="grey-lighten-3">
          <v-icon :icon="typeIcon(stimulus.type)" />
        </v-avatar>

        <div class="flex-grow-1 min-width-0">
          <div class="d-flex align-center ga-2">
            <span class="font-weight-medium">{{ stimulus.name }}</span>
            <v-chip size="x-small" variant="tonal">
              {{ $t(`focusGroup.stimulus.types.${stimulus.type}`) }}
            </v-chip>
          </div>
          <a
            v-if="stimulus.type === 'url'"
            :href="stimulus.url"
            target="_blank"
            rel="noopener"
            class="text-caption text-truncate d-block"
          >
            {{ stimulus.url }}
          </a>
        </div>

        <v-select
          :model-value="stimulus.topicId"
          :items="topics"
          item-title="title"
          item-value="id"
          :label="$t('focusGroup.stimulus.topic')"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          style="max-width: 220px"
          @update:model-value="(value) => onTopicChange(stimulus, value)"
        />

        <v-btn
          icon="mdi-delete-outline"
          size="small"
          variant="text"
          color="error"
          :loading="deletingId === stimulus.id"
          :aria-label="$t('focusGroup.stimulus.remove')"
          @click="removeStimulus(stimulus)"
        />
      </v-card-text>
    </v-card>

    <v-row class="mt-2" dense>
      <v-col cols="12" md="6">
        <label
          class="stimulus-drop-zone"
          :class="{ disabled: uploading }"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <v-icon size="32" class="mb-2">mdi-tray-arrow-up</v-icon>
          <span class="text-body-2">
            {{ $t('focusGroup.stimulus.dropHint') }}
          </span>
          <v-progress-linear v-if="uploading" indeterminate class="mt-2" />
          <input
            type="file"
            accept="image/*,video/*"
            class="stimulus-native-input"
            :disabled="uploading"
            @change="onFilePicked"
          />
        </label>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined" rounded="lg" class="pa-4 h-100">
          <p class="text-body-2 font-weight-medium mb-2">
            {{ $t('focusGroup.stimulus.addLinkTitle') }}
          </p>
          <v-text-field
            v-model="linkName"
            :label="$t('focusGroup.stimulus.linkName')"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-2"
          />
          <v-text-field
            v-model="linkUrl"
            :label="$t('focusGroup.stimulus.linkUrl')"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-3"
          />
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-plus"
            class="text-none"
            :disabled="!linkUrl.trim()"
            :loading="addingLink"
            @click="addLink"
          >
            {{ $t('focusGroup.stimulus.addLink') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/app/plugins/firebase'
import Stimulus from '@/ux/FocusGroup/models/Stimulus'

const props = defineProps({
  studyId: {
    type: String,
    required: true,
  },
  topics: {
    type: Array,
    default: () => [],
  },
})

const store = useStore()

const stimuli = computed(() => store.getters.test?.stimuli ?? [])

const uploading = ref(false)
const addingLink = ref(false)
const deletingId = ref(null)
const linkName = ref('')
const linkUrl = ref('')

const typeIcon = (type) =>
  type === 'video' ? 'mdi-video-outline' : 'mdi-link-variant'

// A protocol-less href (e.g. "randomurl.com") resolves as relative to the
// current page instead of an external site, so the "Open link" affordance
// silently navigates within the app. Default to https:// when missing.
const normalizeUrl = (url) =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`

const persist = (nextStimuli) =>
  store.dispatch('updateStimuli', {
    studyId: props.studyId,
    stimuli: nextStimuli,
  })

const uploadFile = async (file) => {
  uploading.value = true
  try {
    const stimulus = new Stimulus({
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name,
    })
    const path = `tests/${props.studyId}/stimulus_${stimulus.id}/${file.name}`
    const reference = storageRef(storage, path)
    await uploadBytes(reference, file)
    stimulus.url = await getDownloadURL(reference)
    stimulus.storagePath = path
    await persist([...stimuli.value, stimulus])
  } finally {
    uploading.value = false
  }
}

const onFilePicked = (event) => {
  const [file] = event.target.files
  event.target.value = ''
  if (file) uploadFile(file)
}

const onDrop = (event) => {
  if (uploading.value) return
  const [file] = event.dataTransfer.files
  if (file) uploadFile(file)
}

const addLink = async () => {
  if (!linkUrl.value.trim()) return
  addingLink.value = true
  try {
    const stimulus = new Stimulus({
      type: 'url',
      name: linkName.value.trim() || linkUrl.value.trim(),
      url: normalizeUrl(linkUrl.value.trim()),
    })
    await persist([...stimuli.value, stimulus])
    linkName.value = ''
    linkUrl.value = ''
  } finally {
    addingLink.value = false
  }
}

const onTopicChange = (stimulus, topicId) => {
  const next = stimuli.value.map((item) =>
    item.id === stimulus.id
      ? new Stimulus({ ...item, topicId: topicId ?? null })
      : item,
  )
  persist(next)
}

const removeStimulus = async (stimulus) => {
  deletingId.value = stimulus.id
  try {
    const next = stimuli.value.filter((item) => item.id !== stimulus.id)
    await store.dispatch('deleteStimulus', {
      studyId: props.studyId,
      stimulus,
      stimuli: next,
    })
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.stimulus-drop-zone {
  display: flex;
  height: 100%;
  min-height: 140px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 2px dashed #b8c6dc;
  border-radius: 8px;
  color: #405166;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s ease;
}

.stimulus-drop-zone:hover {
  border-color: #00213f;
}

.stimulus-drop-zone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.stimulus-native-input {
  display: none;
}
</style>
