<template>
  <div
    class="screen-share-instructions"
    :class="{ 'screen-share-instructions--compact': compact }"
  >
    <template v-if="showHeader">
      <div class="d-flex align-center mb-3">
        <v-icon color="secondary" size="24" class="mr-2">
          mdi-monitor-share
        </v-icon>
        <h3 class="text-h6 font-weight-bold text-secondary">
          {{ t('screenShare.howTo') }}
        </h3>
      </div>

      <p class="text-body-2 text-grey-darken-3 mb-4 screen-share-lead">
        {{ t('screenShare.lead') }}
      </p>
    </template>

    <div v-if="showDemo" class="picker-demo">
      <div class="picker-video-wrap">
        <video
          v-if="!videoFailed"
          ref="videoRef"
          class="picker-video"
          :src="videoSrc"
          :poster="media.poster || undefined"
          muted
          loop
          playsinline
          preload="metadata"
          disablepictureinpicture
          controlslist="nodownload nofullscreen noremoteplayback"
          :autoplay="!prefersReducedMotion"
          :aria-label="t('screenShare.demoAlt')"
          @error="onVideoError"
        />
        <img
          v-else-if="media.poster"
          class="picker-video"
          :src="media.poster"
          :alt="t('screenShare.demoAlt')"
        />
      </div>
      <p class="picker-video-hint mb-0">
        {{ t(videoHintKey) }}
      </p>
    </div>

    <ol
      v-if="showChecklist"
      class="screen-share-steps mb-0"
      :class="{ 'mt-4': mode === 'full' }"
    >
      <li>{{ t('screenShare.step1') }}</li>
      <li>{{ t('screenShare.step2') }}</li>
      <li>{{ t('screenShare.step3') }}</li>
    </ol>

    <v-alert
      v-if="showAlert"
      class="mt-4 mb-0"
      type="warning"
      variant="tonal"
      density="comfortable"
      icon="mdi-tab-unselected"
    >
      {{ t('screenShare.dontShareTab') }}
    </v-alert>

    <p
      v-if="showMacHint && showMacHintText"
      class="text-caption text-grey-darken-1 mt-3 mb-0"
    >
      {{ t('screenShare.macHint') }}
    </p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getScreenSharePickerFamily,
  isMacOS,
  resolveScreenShareInstructionFamily,
} from '@/shared/utils/screenShareCapture'
import { getScreenShareInstructionMedia } from '@/ux/UserTest/utils/screenShareInstructionMedia'

const props = defineProps({
  hasExternalLink: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  /**
   * full — header, demo, checklist, alerts (dialog default)
   * demo — header, picker demo, alerts (preview step 2)
   * checklist — numbered steps only (preview step 3)
   */
  mode: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'demo', 'checklist'].includes(value),
  },
})

const { t } = useI18n()
const videoRef = ref(null)
const videoFailed = ref(false)

function readPrefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const prefersReducedMotion = ref(readPrefersReducedMotion())

const showMacHint = computed(() => isMacOS())
const pickerFamily = computed(() =>
  resolveScreenShareInstructionFamily(getScreenSharePickerFamily()),
)
const media = computed(() => getScreenShareInstructionMedia(pickerFamily.value))
const videoOverride = ref(null)
const videoSrc = computed(() => videoOverride.value || media.value.video)
const videoHintKey = computed(() =>
  pickerFamily.value === 'firefox'
    ? 'screenShare.videoHintFirefox'
    : 'screenShare.videoHint',
)

const showHeader = computed(
  () => props.mode === 'full' || props.mode === 'demo',
)
const showDemo = computed(() => props.mode === 'full' || props.mode === 'demo')
const showChecklist = computed(
  () => props.mode === 'full' || props.mode === 'checklist',
)
const showAlert = computed(
  () =>
    props.hasExternalLink &&
    (props.mode === 'full' || props.mode === 'demo'),
)
const showMacHintText = computed(
  () => props.mode === 'full' || props.mode === 'demo',
)

let motionQuery = null

function tryPlayVideo() {
  const el = videoRef.value
  if (!el?.play || prefersReducedMotion.value) return
  try {
    const playback = el.play()
    if (playback?.catch) playback.catch(() => {})
  } catch {
    // jsdom and some browsers throw instead of returning a rejected promise.
  }
}

function pauseVideo() {
  const el = videoRef.value
  if (!el?.pause) return
  try {
    el.pause()
  } catch {
    // Ignore browsers that reject pause before metadata loads.
  }
}

function syncVideoPlayback(shouldReduceMotion) {
  prefersReducedMotion.value = shouldReduceMotion
  if (shouldReduceMotion) {
    pauseVideo()
    return
  }
  tryPlayVideo()
}

function onMotionPreferenceChange(event) {
  syncVideoPlayback(event.matches)
}

function onVideoError() {
  const fallback = media.value.sources?.[1]?.src
  if (fallback && videoSrc.value !== fallback) {
    videoOverride.value = fallback
    return
  }
  videoFailed.value = true
}

onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQuery.matches
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', onMotionPreferenceChange)
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onMotionPreferenceChange)
  }
})

onBeforeUnmount(() => {
  if (!motionQuery) return
  if (motionQuery.removeEventListener) {
    motionQuery.removeEventListener('change', onMotionPreferenceChange)
  } else if (motionQuery.removeListener) {
    motionQuery.removeListener(onMotionPreferenceChange)
  }
})

watch(media, () => {
  videoFailed.value = false
  videoOverride.value = null
})
</script>

<style scoped>
.screen-share-lead {
  line-height: 1.5;
}

.screen-share-steps {
  padding-left: 1.25rem;
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.55;
}

.screen-share-steps li + li {
  margin-top: 6px;
}

.picker-demo {
  background: #eef2f6;
  border-radius: 16px;
  padding: 12px;
}

.picker-video-wrap {
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
}

.picker-video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #f8fafc;
}

.picker-video-hint {
  margin-top: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #166534;
  text-align: center;
  line-height: 1.4;
}

.screen-share-instructions--compact .picker-demo {
  padding: 8px;
}

@media (prefers-reduced-motion: reduce) {
  .picker-video {
    object-fit: contain;
    background: #fff;
  }
}
</style>
