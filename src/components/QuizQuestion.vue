<template>
  <div class="quiz-content">
    <h2 class="text-h5 font-weight-bold mb-4 text-center">
      {{ currentQuestion.title }}
    </h2>
    <p class="text-body-1 mb-5 text-grey-darken-1 text-center">
      {{ currentQuestion.description }}
    </p>
    <div class="pa-5 mb-8 criterion-card text-primary">
      <p class="text-body-1">
        {{ currentCriterion }}
      </p>
      <div
        v-for="(ev, idx) in currentEvidenceList"
        :key="idx"
        class="mb-4 mt-4"
      >
        <v-card class="mb-2 evidenceNotes">
          <v-card-title
            class="d-flex align-center justify-space-between py-2 px-4"
          >
            <span>Evidence & Note #{{ idx + 1 }}</span>
            <v-btn
              v-if="currentEvidenceList.length > 1"
              icon="mdi-close"
              color="error"
              size="small"
              title="Remove"
              @click="$emit('remove-evidence', idx)"
            />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-file-input
              v-model="ev.file"
              accept="image/*"
              variant="underlined"
              clearable
              label="Upload Screenshot Evidence"
              prepend-icon="mdi-camera"
              class="mt-2"
              @update:model-value="
                (file) => $emit('evidence-upload', file, idx)
              "
            />
            <v-textarea
              v-model="ev.note"
              label="Appraiser Notes"
              variant="outlined"
              clearable
              placeholder="Add your observations and notes here..."
              rows="3"
              class="mt-2"
            />
          </v-card-text>
        </v-card>
        <v-divider
          v-if="idx < currentEvidenceList.length - 1"
          class="my-2"
        />
      </div>
      <div class="d-flex justify-center">
        <v-btn
          color="primary"
          size="large"
          class="mt-2"
          style="min-width: 220px"
          title="Add more evidence/note"
          prepend-icon="mdi-plus"
          @click="$emit('add-evidence')"
        >
          Add More Evidence/Note
        </v-btn>
      </div>
    </div>
    <div class="button-container d-flex align-center justify-center flex-wrap">
      <v-btn
        color="success"
        class="ma-2 answer-btn"
        size="large"
        min-width="120"
        elevation="2"
        @click="$emit('answer', 'yes')"
      >
        <v-icon start>
          mdi-check
        </v-icon>
        Yes
      </v-btn>
      <v-btn
        color="error"
        class="ma-2 answer-btn"
        size="large"
        min-width="120"
        elevation="2"
        @click="$emit('answer', 'no')"
      >
        <v-icon start>
          mdi-close
        </v-icon>
        No
      </v-btn>
      <v-btn
        color="grey"
        class="ma-2 answer-btn"
        size="large"
        min-width="120"
        elevation="2"
        @click="$emit('answer', 'na')"
      >
        <v-icon start>
          mdi-minus
        </v-icon>
        N/A
      </v-btn>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  currentQuestion: Object,
  currentCriterion: String,
  currentEvidenceList: Array,
})
const emit = defineEmits([
  'answer',
  'add-evidence',
  'remove-evidence',
  'evidence-upload',
])
</script>
<style scoped>
.evidenceNotes {
  background: linear-gradient(120deg, #fafafa 0%, #f0f0f0 100%);
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(200, 200, 200, 0.1);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.evidenceNotes:hover {
  box-shadow: 0 6px 20px 0 rgba(200, 200, 200, 0.18);
  border-color: #bdbdbd;
}
</style>
