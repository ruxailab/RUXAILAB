<template>
  <v-row>
    <v-col
      class="mt-8"
      cols="8"
    >
      <video
        ref="remoteMedia"
        class="video"
        muted
        autoplay
        playsinline
      />
    </v-col>
    <v-col
      class="mt-8"
      cols="4"
    >
      <video
        ref="localMedia"
        class="video"
        muted
        autoplay
        playsinline
      />
    </v-col>
    <v-col cols="12">
      <v-row justify="center">
        <v-card
          class="pa-2 buttonCard"
          depressed
        >
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-if="localCameraStream"
                class="mx-3"
                :class="{ red: isMicrophoneMuted, white: !isMicrophoneMuted }"
                icon
                variant="flat"
                v-bind="props"
                @click="toggleMicrophone"
              >
                <v-icon v-if="!isMicrophoneMuted">
                  mdi-microphone
                </v-icon>
                <v-icon v-else>
                  mdi-microphone-off
                </v-icon>
              </v-btn>
            </template>
            <span>{{
              isMicrophoneMuted ? 'Unmute microphone' : 'Mute microphone'
            }}</span>
          </v-tooltip>
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                class="mx-3"
                :class="{ red: isSharingScreen, white: !isSharingScreen }"
                variant="flat"
                icon
                v-bind="props"
                @click="toggleCameraScreen"
              >
                <v-icon v-if="!isSharingScreen">
                  mdi-monitor-screenshot
                </v-icon>
                <v-icon v-else>
                  mdi-monitor-off
                </v-icon>
              </v-btn>
            </template>
            <span>{{
              isSharingScreen ? 'Stop screen sharing' : 'Share screen'
            }}</span>
          </v-tooltip>
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                class="mx-3 bg-white"
                variant="flat"
                icon
                v-bind="props"
                @click="redirect"
              >
                <v-icon>
                  mdi-link
                </v-icon>
              </v-btn>
            </template>
            <span>Open link</span>
          </v-tooltip>
        </v-card>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';

// Props
defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
});

// Vuex store
const store = useStore();

// Vue Router
const router = useRouter();

// Vue Toastification
const toast = useToast();

// Vue I18n
const { t } = useI18n();

// Refs for reactive state
const hide = ref(true);
const isMicrophoneMuted = ref(false);
const isSharingScreen = ref(false);
const usingCamera = ref(true);

// Refs for DOM elements
const localMedia = ref(null);
const remoteMedia = ref(null);

// Computed properties (mapped from Vuex getters)
const test = computed(() => store.getters.test);
const localCameraStream = computed(() => store.getters.localCameraStream);
const remoteCameraStream = computed(() => store.getters.remoteCameraStream);
const roomTestId = computed(() => store.getters.test.id);
const peerConnection = computed(() => store.getters.peerConnection);

// Methods
const redirect = () => {
  if (test.value.testStructure.landingPage.trim() === '') {
    toast.error(t('errors.globalError'));
    return;
  }
  console.log(test.value.testStructure.landingPage);
  window.open(test.value.testStructure.landingPage);
};

const setupStreams = () => {
  console.log('setupStreams');
  if (localMedia.value) {
    localMedia.value.srcObject = localCameraStream.value;
  }
  if (remoteMedia.value) {
    remoteMedia.value.srcObject = remoteCameraStream.value;
  }
};

const toggleMicrophone = () => {
  if (
    localCameraStream.value &&
    localCameraStream.value.getAudioTracks().length > 0
  ) {
    const audioTrack = localCameraStream.value
      .getTracks()
      .find((track) => track.kind === 'audio');
    audioTrack.enabled = !audioTrack.enabled;
    isMicrophoneMuted.value = !audioTrack.enabled;
  }
};

const toggleCameraScreen = async () => {
  try {
    let stream;

    if (usingCamera.value) {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
    }

    if (stream) {
      await store.dispatch('changeTrack', stream);
      isSharingScreen.value = !isSharingScreen.value;
      usingCamera.value = !usingCamera.value;
    }
  } catch (e) {
    toast.error(t('errors.globalError'));
  }
};

const hangUp = () => {
  router.push('/testslist');
};

// Watchers
watch(localCameraStream, () => {
  setupStreams();
});

watch(remoteCameraStream, () => {
  setupStreams();
});

// Lifecycle hook
onMounted(() => {
  setupStreams();
});
</script>

<style scoped>
.video {
  border-radius: 30px;
  width: 100%;
  object-fit: contain;
  margin-top: 5vh;
}
.buttonCard {
  background: rgb(77, 77, 77);
  background: linear-gradient(
    180deg,
    rgb(190, 190, 190) 0%,
    rgb(170, 170, 170) 100%
  );
  border-radius: 20px;
  margin-top: 10vh;
}
</style>