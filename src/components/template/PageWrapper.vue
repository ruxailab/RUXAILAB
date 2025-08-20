<template>
  <v-app>
    <v-main>
      <Snackbar />

      <!-- Loading Overlay -->
      <v-overlay
        v-if="loading"
        model-value="loading"
        class="text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="50"
        />
        <div class="text-white mt-3">
          {{ loadingText || $t('common.loading') }}
        </div>
      </v-overlay>

      <!-- Main Container -->
      <v-container>
        <!-- Header Section -->
        <div
          v-if="title || $slots.actions"
          class="header-section"
        >
          <v-row
            align="center"
            class=""
          >
            <v-col>
              <h1
                v-if="title"
                class="text-h3 font-weight-light text-on-surface"
              >
                {{ title }}
              </h1>
              <slot name="subtitle" />
            </v-col>
            <v-col
              v-if="$slots.actions"
              cols="auto"
            >
              <slot name="actions" />
            </v-col>
          </v-row>
          <!-- Filters Slot -->
          <slot name="filters" />
        </div>

        <!-- Main Content Slot -->
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import Snackbar from '@/components/atoms/Snackbar.vue';

defineProps({
  title: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: '',
  },
  sideGap: {
    type: Boolean,
    default: true,
  },
});

const { t } = useI18n();
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: #fafbfc;
}

.side-gap {
  padding: 1.5rem 3rem;
}
</style>