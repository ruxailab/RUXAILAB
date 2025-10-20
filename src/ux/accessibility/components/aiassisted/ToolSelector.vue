<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title class="bg-purple-lighten-5">
      <v-icon icon="mdi-tools" class="mr-2" />
      Select Analysis to View
    </v-card-title>
    <v-card-text class="pa-6">
      <p class="text-body-1 mb-4">Choose which tool analysis you want to view in detail:</p>
      
      <v-row>
        <!-- ChromaCheck Card -->
        <v-col cols="12" md="4">
          <v-card
            :class="['tool-card', { 'tool-available': toolStatus.chroma_check, 'tool-unavailable': !toolStatus.chroma_check }]"
            :disabled="!toolStatus.chroma_check"
            variant="outlined"
            hover
            @click="selectTool('chroma_check')"
          >
            <v-card-text class="text-center pa-6">
              <v-icon 
                icon="mdi-palette" 
                :color="toolStatus.chroma_check ? 'purple' : 'grey'" 
                size="64" 
                class="mb-3"
              />
              <h3 class="text-h6 mb-2">ChromaCheck</h3>
              <p class="text-caption mb-3">Color Contrast Analysis</p>
              
              <v-chip 
                :color="toolStatus.chroma_check ? 'green' : 'grey'"
                size="small"
                class="mb-3"
              >
                {{ toolStatus.chroma_check ? 'Available' : 'Not Run' }}
              </v-chip>
              
              <div v-if="toolStatus.chroma_check && results.chroma_check">
                <v-divider class="my-3" />
                <div class="text-caption">
                  <strong>{{ results.chroma_check.total_issues || 0 }}</strong> issues found
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- AnchorSense Card -->
        <v-col cols="12" md="4">
          <v-card
            :class="['tool-card', { 'tool-available': toolStatus.anchor_sense, 'tool-unavailable': !toolStatus.anchor_sense }]"
            :disabled="!toolStatus.anchor_sense"
            variant="outlined"
            hover
            @click="selectTool('anchor_sense')"
          >
            <v-card-text class="text-center pa-6">
              <v-icon 
                icon="mdi-link-variant" 
                :color="toolStatus.anchor_sense ? 'blue' : 'grey'" 
                size="64" 
                class="mb-3"
              />
              <h3 class="text-h6 mb-2">AnchorSense</h3>
              <p class="text-caption mb-3">Anchor Tag Analysis</p>
              
              <v-chip 
                :color="toolStatus.anchor_sense ? 'green' : 'grey'"
                size="small"
                class="mb-3"
              >
                {{ toolStatus.anchor_sense ? 'Available' : 'Not Run' }}
              </v-chip>
              
              <div v-if="toolStatus.anchor_sense && results.anchor_sense">
                <v-divider class="my-3" />
                <div class="text-caption">
                  <strong>{{ results.anchor_sense.total_issues || 0 }}</strong> issues found
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ImgTagTip Card -->
        <v-col cols="12" md="4">
          <v-card
            :class="['tool-card', { 'tool-available': toolStatus.img_tip, 'tool-unavailable': !toolStatus.img_tip }]"
            :disabled="!toolStatus.img_tip"
            variant="outlined"
            hover
            @click="selectTool('img_tip')"
          >
            <v-card-text class="text-center pa-6">
              <v-icon 
                icon="mdi-image-text" 
                :color="toolStatus.img_tip ? 'green' : 'grey'" 
                size="64" 
                class="mb-3"
              />
              <h3 class="text-h6 mb-2">ImgTagTip</h3>
              <p class="text-caption mb-3">Image Alt Text Analysis</p>
              
              <v-chip 
                :color="toolStatus.img_tip ? 'green' : 'grey'"
                size="small"
                class="mb-3"
              >
                {{ toolStatus.img_tip ? 'Available' : 'Not Run' }}
              </v-chip>
              
              <div v-if="toolStatus.img_tip && results.img_tip">
                <v-divider class="my-3" />
                <div class="text-caption">
                  <strong>{{ results.img_tip.issues_found || 0 }}</strong> issues found
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Tools Available Message -->
      <v-alert v-if="!hasAnyResults" type="warning" variant="tonal" class="mt-4">
        <div class="d-flex align-center justify-space-between">
          <span>No analysis results available yet. Run the tools first.</span>
          <v-btn 
            color="purple" 
            variant="elevated" 
            size="small"
            @click="$emit('run-analysis')"
          >
            Run Analysis
          </v-btn>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  toolStatus: {
    type: Object,
    required: true
  },
  results: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['select-tool', 'run-analysis']);

const hasAnyResults = computed(() => {
  return props.toolStatus.chroma_check || props.toolStatus.anchor_sense || props.toolStatus.img_tip;
});

const selectTool = (toolName) => {
  if (props.toolStatus[toolName]) {
    emit('select-tool', toolName);
  }
};
</script>

<style scoped>
.tool-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.tool-card:not(.tool-unavailable):hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.tool-available {
  border: 2px solid rgb(var(--v-theme-green));
  background-color: rgba(76, 175, 80, 0.03);
}

.tool-unavailable {
  border: 2px solid rgb(var(--v-theme-grey-lighten-2));
  opacity: 0.6;
  cursor: not-allowed;
}

.tool-unavailable:hover {
  transform: none;
}
</style>
