<template>
  <div>
    <v-col>
      <v-row>
        <v-tooltip v-if="!isCapturing" location="bottom">
          <template #activator="{ props }">
            <v-btn
              class="ml-4 my-2 mr-auto"
              elevation="0"
              icon
              v-bind="props"
              @click="captureScreen"
            >
              <v-icon>mdi-monitor-screenshot</v-icon>
            </v-btn>
          </template>
          <span>Capture Screen</span>
        </v-tooltip>
        <v-tooltip v-if="isCapturing" location="bottom">
          <template #activator="{ props }">
            <v-btn
              class="ml-4 my-2 mr-auto"
              :color="!isRecording ? 'grey-darken-1' : 'red lighten-1'"
              elevation="0"
              icon
              v-bind="props"
              @click="recordScreen"
            >
              <v-icon>
                {{ isRecording ? 'mdi-stop' : 'mdi-monitor-screenshot' }}
              </v-icon>
            </v-btn>
          </template>
          <span>{{ isRecording ? 'Stop Recording' : 'Record Screen' }}</span>
        </v-tooltip>
      </v-row>
    </v-col>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const props = defineProps({
  testId: String,
  taskIndex: Number,
});

const emit = defineEmits(['showLoading', 'stopShowLoading']);

const store = useStore();
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer);

const { t } = useI18n();
const toast = useToast();

const isCapturing = ref(false);
const isRecording = ref(false);
const videoUrl = ref('');
const videoStream = ref(null);
const mediaRecorder = ref(null);
const chunks = ref([]);

const captureScreen = async () => {
  try {
    videoStream.value = await navigator.mediaDevices.getDisplayMedia({
      cursor: true,
    });
    isCapturing.value = true;
    recordScreen();
  } catch (err) {
    console.error(err);
  }
};

const recordScreen = async () => {
  if (!isRecording.value) {
    chunks.value = [];
    mediaRecorder.value = new MediaRecorder(videoStream.value);
    mediaRecorder.value.start();

    mediaRecorder.value.ondataavailable = (e) => {
      chunks.value.push(e.data);
    };

    mediaRecorder.value.onstop = async () => {
      emit('showLoading');
      const videoBlob = new Blob(chunks.value, { type: 'video/webm' });
      const storage = getStorage();
      const storagePath = `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${props.taskIndex}/screen_record/${videoUrl.value}`;
      const storageReference = storageRef(storage, storagePath);

      await uploadBytes(storageReference, videoBlob);
      videoUrl.value = await getDownloadURL(storageReference);

      currentUserTestAnswer.value.tasks[props.taskIndex].screenRecordURL = videoUrl.value;

      // Stop all tracks
      videoStream.value.getTracks().forEach((track) => track.stop());
      isRecording.value = false;
      isCapturing.value = false;

      emit('stopShowLoading');
      toast.success(t('alerts.genericSuccess'));
    };

    isRecording.value = true;
  } else {
    mediaRecorder.value.stop();
  }
};
</script>

<style scoped></style>