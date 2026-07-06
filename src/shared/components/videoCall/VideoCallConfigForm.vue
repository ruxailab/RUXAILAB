<template>
  <v-row justify="center">
    <v-col lg="12" class="px-0 py-5">
      <v-card class="elevation-2 rounded-lg pa-md-6" width="100%">
        <v-row class="pa-4 pa-0">
          <v-col>
            <v-card-title
              class="text-h5 font-weight-bold pa-0"
              :style="{ color: $vuetify.theme.current.colors['on-surface'] }"
            >
              {{ $t('videoCall.title') }}
            </v-card-title>

            <p class="text-body-1" style="color: #4b5563">
              {{ $t('videoCall.description') }}
            </p>
          </v-col>
        </v-row>

        <v-card-text>
          <!-- Feature disabled via environment flag -->
          <v-alert
            v-if="!videoCallEnabled"
            type="warning"
            variant="tonal"
            density="comfortable"
          >
            <template #prepend>
              <v-icon>mdi-video-off-outline</v-icon>
            </template>
            {{ $t('videoCall.disabledMessage') }}
          </v-alert>

          <!-- Provider selection -->
          <template v-else>
            <v-radio-group
              v-model="providerModel"
              :disabled="readonly || hasActiveSession"
              hide-details
            >
              <v-radio :value="VIDEO_CALL_PROVIDERS.MESH" class="mb-4">
                <template #label>
                  <div class="provider-option">
                    <div class="d-flex align-center flex-wrap ga-2">
                      <span class="font-weight-medium">
                        {{ $t('videoCall.providers.mesh.name') }}
                      </span>
                      <v-chip size="small" color="primary" variant="tonal">
                        {{ $t('videoCall.providers.mesh.range') }}
                      </v-chip>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0 mt-1">
                      {{ $t('videoCall.providers.mesh.description') }}
                    </p>
                  </div>
                </template>
              </v-radio>

              <v-radio :value="VIDEO_CALL_PROVIDERS.LIVEKIT">
                <template #label>
                  <div class="provider-option">
                    <div class="d-flex align-center flex-wrap ga-2">
                      <span class="font-weight-medium">
                        {{ $t('videoCall.providers.livekit.name') }}
                      </span>
                      <v-chip size="small" color="secondary" variant="tonal">
                        {{ $t('videoCall.providers.livekit.range') }}
                      </v-chip>
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-0 mt-1">
                      {{ $t('videoCall.providers.livekit.description') }}
                    </p>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <v-alert
              v-if="hasActiveSession"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-4"
            >
              <template #prepend>
                <v-icon>mdi-information-outline</v-icon>
              </template>
              {{ $t('videoCall.sessionActiveWarning') }}
            </v-alert>
          </template>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { database } from '@/app/plugins/firebase/index'
import { ref as dbRef, get } from 'firebase/database'
import {
  VIDEO_CALL_PROVIDERS,
  DEFAULT_VIDEO_CALL_CONFIG,
} from '@/shared/constants/videoCallProviders'

const props = defineProps({
  testId: {
    type: String,
    default: '',
  },
  videoCall: {
    type: Object,
    default: () => ({ ...DEFAULT_VIDEO_CALL_CONFIG }),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:videoCall'])

const hasActiveSession = ref(false)

const videoCallEnabled = computed(() => {
  return process.env.VUE_APP_LIVEKIT_ENABLED !== 'false'
})

const providerModel = computed({
  get() {
    return props.videoCall?.provider ?? VIDEO_CALL_PROVIDERS.MESH
  },
  set(provider) {
    emit('update:videoCall', {
      ...props.videoCall,
      provider,
    })
  },
})

onMounted(async () => {
  if (!props.testId) return
  try {
    const snapshot = await get(dbRef(database, `rooms/${props.testId}`))
    hasActiveSession.value = snapshot.exists()
  } catch {
    hasActiveSession.value = false
  }
})
</script>

<style scoped>
.provider-option {
  padding: 4px 0;
}
</style>
