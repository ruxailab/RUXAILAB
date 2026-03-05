<template>
  <v-container>
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <h3>Transcripts</h3>
        <v-divider />
      </v-col>
    </v-row>

    <!-- Scrollable List -->
    <v-row>
      <v-col cols="12">
        <v-list v-model:selected="selected" lines="two" class="scrollable-list">
          <template v-for="(region, index) in regions" :key="region.title">
            <v-list-item class="py-3">
              <!-- Prepend: ícone e confiança -->
              <template #prepend>
                <div class="icon-and-confidence text-center mr-3">
                  <v-icon v-if="region.sentiment === 'POS'" color="green">
                    mdi-emoticon-happy-outline
                  </v-icon>
                  <v-icon v-else-if="region.sentiment === 'NEU'" color="blue">
                    mdi-emoticon-neutral-outline
                  </v-icon>
                  <v-icon v-else color="red"> mdi-emoticon-sad-outline </v-icon>
                  <div class="text-caption">
                    {{ (region.confidence * 100).toFixed(2) }}%
                  </div>
                </div>
              </template>

              <!-- Conteúdo principal -->
              <v-list-item-title class="white-space-normal text-wrap">
                {{ region.transcript }}
              </v-list-item-title>

              <v-list-item-subtitle class="text-caption text-grey">
                {{ formatTime(region.start) }} - {{ formatTime(region.end) }}
              </v-list-item-subtitle>

              <!-- Append: botão delete -->
              <template #append>
                <v-btn icon variant="text" @click="deleteRegion(region)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>

            <v-divider v-if="index < regions.length - 1" />
          </template>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { formatTime } from '@/shared/utils/timeUtils'

const props = defineProps({
  regions: {
    type: Array,
    default: () => [],
  },
  playSegment: {
    type: Function,
    default: () => {},
  },
  deleteRegion: {
    type: Function,
    default: () => {},
  },
})

const selected = ref([])
</script>

<style scoped>
h3 {
  font-style: normal;
  font-weight: 300;
  color: #000000;
}

.scrollable-list {
  height: 250px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.scrollable-list::-webkit-scrollbar {
  width: 8px;
}

.scrollable-list::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.scrollable-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.play-segment-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.segment-time {
  font-size: 10px;
  color: grey;
  margin-top: 4px;
}

.icon-and-confidence {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.white-space-normal {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
}

.text-wrap {
  word-break: break-word;
}
</style>
