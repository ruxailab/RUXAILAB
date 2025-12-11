<template>
  <v-app>
    <v-main class="ma-5">
      <Snackbar />

      <!-- Loading Overlay -->
      <v-overlay
        v-if="loading"
        model-value="loading"
        class="text-center justify-center align-center"
        persistent
        opacity="0.8"
      >
        <XLoader />
        <div class="text-white mt-5 font-weight-bold text-h6">
          {{ loadingText || $t('common.loading') }}
        </div>
      </v-overlay>

      <!-- Main Container -->
      <v-container
        fluid
        class="page-wrapper"
        :class="{ 'side-gap': sideGap }"
      >
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
import Snackbar from '@/shared/components/Snackbar';
import Loading from '@/shared/components/Loading.vue';
import XLoader from '@/shared/components/XLoader.vue';

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
</script>

