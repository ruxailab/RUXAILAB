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
        <v-list
          v-model:selected="selected"
          lines="two"
          class="scrollable-list"
        >
          <template
            v-for="(region, index) in regions"
            :key="region.title"
          >
            <v-list-item>
              <!-- Prepend Slot: Play Button and Time -->
              <template #prepend>
                <div class="play-segment-container">
                  <!-- Play Button -->
                  <v-btn
                    icon
                    @click="playSegment(region.start, region.end)"
                  >
                    <v-icon
                      color="orange"
                      size="large"
                    >
                      mdi-play
                    </v-icon>
                  </v-btn>
                  <!-- Start and End Times -->
                  <div class="segment-time">
                    {{ region.start.toFixed(2) }} - {{ region.end.toFixed(2) }}
                  </div>
                </div>
              </template>

              <!-- List Item Content -->
              <v-list-item-subtitle class="text--primary">
                {{ region.transcript }}
              </v-list-item-subtitle>

              <!-- Append Slot: Sentiment Icon, Confidence, and Delete Button -->
              <template #append>
                <div class="icon-and-confidence">
                  <!-- Face Icon based on sentiment -->
                  <v-icon
                    v-if="region.sentiment === 'POS'"
                    color="green"
                  >
                    mdi-emoticon-happy-outline
                  </v-icon>
                  <v-icon
                    v-else-if="region.sentiment === 'NEU'"
                    color="blue"
                  >
                    mdi-emoticon-neutral-outline
                  </v-icon>
                  <v-icon
                    v-else-if="region.sentiment === 'NEG'"
                    color="red"
                  >
                    mdi-emoticon-sad-outline
                  </v-icon>
                  <!-- Confidence Value Below the Icon -->
                  <div>{{ (region.confidence * 100).toFixed(2) }}%</div>
                </div>
                <!-- Delete Icon Button -->
                <v-btn
                  icon
                  @click="deleteRegion(region)"
                >
                  <v-icon color="red">
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
            </v-list-item>

            <v-divider
              v-if="index < regions.length - 1"
              :key="index"
            />
          </template>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
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
  },

  data: () => ({
    selected: [],
  }),

  methods: {},
}
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
</style>