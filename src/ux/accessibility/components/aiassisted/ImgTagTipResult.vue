<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title class="bg-green-lighten-5 d-flex align-center">
      <v-btn
        icon
        size="small"
        variant="text"
        @click="$emit('back')"
        class="mr-2"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-icon icon="mdi-image-text" color="green" size="large" class="mr-2" />
      <div class="flex-grow-1">ImgTagTip - Image Alt Text Analysis</div>
      <v-chip color="green" size="small">Completed</v-chip>
    </v-card-title>
    
    <v-card-text class="pa-6">
      <!-- Summary Stats -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-card color="blue-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-image" color="blue" size="x-large" />
              <h3 class="text-h3">{{ results.total_images || 0 }}</h3>
              <p class="text-caption">Total Images</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card color="red-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-alert" color="red" size="x-large" />
              <h3 class="text-h3">{{ results.issues_found || 0 }}</h3>
              <p class="text-caption">Issues Found</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card color="green-lighten-5" class="pa-4">
            <div class="text-center">
              <v-icon icon="mdi-check-circle" color="green" size="x-large" />
              <h3 class="text-h3">{{ (results.total_images || 0) - (results.issues_found || 0) }}</h3>
              <p class="text-caption">Has Alt Text</p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Images with Issues -->
      <div v-if="results.images?.length > 0">
        <v-divider class="mb-4" />
        <h3 class="text-h6 mb-3">
          <v-icon icon="mdi-image-alert" color="green" class="mr-2" />
          Images Requiring Alt Text ({{ results.images.length }})
        </h3>
        
        <v-row>
          <v-col
            v-for="(image, index) in results.images"
            :key="index"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card variant="outlined" class="image-card">
              <v-card-text class="pa-4">
                <!-- Image Preview -->
                <div class="image-preview-container mb-3">
                  <v-img
                    v-if="image.src"
                    :src="image.src"
                    height="200"
                    cover
                    class="rounded"
                  >
                    <template #error>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <div class="text-center">
                          <v-icon icon="mdi-image-broken" size="64" color="grey" />
                          <p class="text-caption mt-2">Image not available</p>
                        </div>
                      </div>
                    </template>
                  </v-img>
                  <div v-else class="no-image-placeholder">
                    <v-icon icon="mdi-image-off" size="64" color="grey" />
                    <p class="text-caption mt-2">No preview available</p>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="mb-3">
                  <v-chip
                    :color="image.has_alt ? 'green' : 'red'"
                    size="small"
                    class="mr-2"
                  >
                    <v-icon 
                      :icon="image.has_alt ? 'mdi-check' : 'mdi-close'" 
                      start 
                      size="small"
                    />
                    {{ image.has_alt ? 'Has Alt Text' : 'Missing Alt Text' }}
                  </v-chip>
                </div>
                
                <!-- Current Alt Text -->
                <div class="mb-3">
                  <div class="text-subtitle-2 mb-1">
                    <v-icon icon="mdi-text" size="small" class="mr-1" />
                    Current Alt Text:
                  </div>
                  <v-card color="grey-lighten-4" variant="flat" class="pa-2">
                    <p class="text-body-2 mb-0 text-grey-darken-1">
                      {{ image.current_alt || '(empty)' }}
                    </p>
                  </v-card>
                </div>

                <v-divider class="my-3" />

                <!-- AI Suggestion -->
                <div class="mb-3">
                  <div class="text-subtitle-2 mb-2 d-flex align-center">
                    <v-icon icon="mdi-brain" size="small" color="green" class="mr-1" />
                    AI-Generated Suggestion:
                  </div>
                  <v-card color="green-lighten-5" variant="flat" class="pa-3">
                    <p class="text-body-2 mb-0">
                      {{ image.suggested_alt || 'No suggestion available' }}
                    </p>
                  </v-card>
                  
                  <v-btn
                    v-if="image.suggested_alt"
                    color="green"
                    variant="text"
                    size="small"
                    class="mt-2"
                    prepend-icon="mdi-content-copy"
                    @click="copyToClipboard(image.suggested_alt)"
                  >
                    Copy Suggestion
                  </v-btn>
                </div>

                <!-- Image Source -->
                <v-text-field
                  v-if="image.src"
                  :model-value="image.src"
                  label="Image Source URL"
                  density="compact"
                  readonly
                  variant="outlined"
                  hide-details
                  class="text-caption"
                >
                  <template #append-inner>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="copyToClipboard(image.src)"
                    >
                      <v-icon size="small">mdi-content-copy</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- No Issues Found -->
      <v-alert v-else type="success" variant="tonal" class="mt-4">
        <v-icon icon="mdi-check-circle" class="mr-2" />
        No image alt text issues found! All images have descriptive alternative text.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  results: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back']);

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard!');
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<style scoped>
.image-card {
  height: 100%;
  transition: all 0.3s ease;
}

.image-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-preview-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.no-image-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}
</style>
