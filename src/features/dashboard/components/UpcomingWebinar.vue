<template>
  <v-card
    elevation="1"
    elevation-hover="2"
    rounded="lg"
    class="upcoming-webinar-card position-relative"
  >
    <!-- Coming Soon Overlay -->
    <v-chip
      color="primary"
      variant="elevated"
      size="small"
      class="coming-soon-chip"
    >
      <span class="chip-text">Coming Soon</span>
    </v-chip>

    <!-- Hero Image Section -->
    <v-img
      class="align-end text-white"
      :height="heroHeight"
      src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
      cover
    >
      <v-card-title class="hero-title">Some Text</v-card-title>
    </v-img>

    <v-card-text class="card-content pa-4 pa-md-6">
      <!-- Webinar Title -->
      <h2 class="webinar-title text-h6 text-md-h5 font-weight-bold mb-2 mb-md-3">
        {{ webinar.title }}
      </h2>

      <!-- Webinar Description -->
      <p class="webinar-description text-body-2 text-md-body-1 text-grey-darken-1 mb-4 mb-md-5">
        {{ webinar.description }}
      </p>

      <!-- Date and Duration Info -->
      <v-row
        class="info-row mb-4 mb-md-5"
        :no-gutters="isSmallScreen"
      >
        <v-col
          cols="6"
          :class="isSmallScreen ? 'pr-1' : 'pr-2'"
        >
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon
                icon="mdi-calendar"
                size="small"
                class="info-icon"
                color="primary"
              />
            </div>
            <div class="info-content">
              <div class="info-value">
                {{ webinar.date }}
              </div>
              <div class="info-label">Date</div>
            </div>
          </div>
        </v-col>
        <v-col
          cols="6"
          :class="isSmallScreen ? 'pl-1' : ''"
        >
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon
                icon="mdi-clock-outline"
                size="small"
                class="info-icon"
                color="primary"
              />
            </div>
            <div class="info-content">
              <div class="info-value">
                {{ webinar.duration }}
              </div>
              <div class="info-label">Time</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Join Button -->
      <v-btn
        color="primary"
        variant="flat"
        :size="buttonSize"
        block
        rounded="lg"
        class="join-button"
        :prepend-icon="showButtonIcon ? 'mdi-calendar-clock' : undefined"
        disabled
      >
        <span class="button-text">{{ buttonText }}</span>
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const windowWidth = ref(window.innerWidth)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const props = defineProps({
    webinarData: {
        type: Object,
        default: () => ({})
    }
})

// Responsive computed properties
const heroHeight = computed(() => {
  return window.innerWidth < 600 ? '160px' : '200px'
})

const isSmallScreen = computed(() => {
  return window.innerWidth < 600
})

const buttonSize = computed(() => {
  return window.innerWidth < 600 ? 'default' : 'large'
})

const showButtonIcon = computed(() => {
  return window.innerWidth >= 400
})

const buttonText = computed(() => {
  if (windowWidth.value < 400) return 'Nov'
  if (windowWidth.value < 500) return 'Coming Nov'
  return 'Coming in November'
})

const webinar = computed(() => {
    if (Object.keys(props.webinarData).length > 0) {
        return props.webinarData
    }

    // Default webinar data
    return {
        title: 'Monthly Office Hours',
        description: 'Starting in November, we will host monthly office hours to discuss project updates, answer questions, and connect with our community.',
        date: 'Nov 2025',
        duration: 'Monthly'
    }
})
</script>

<style scoped>
.upcoming-webinar-card {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.coming-soon-chip {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: none;
}

.chip-text {
    font-size: 0.7rem;
}

.hero-title {
    font-size: 1.5rem;
    font-weight: 600;
    padding-bottom: 16px;
    padding-left: 24px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
}

.card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.webinar-title {
    line-height: 1.3;
}

.webinar-description {
    line-height: 1.6;
    flex: 1;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.info-icon-wrapper {
    background-color: rgba(var(--v-theme-primary), 0.1);
    border-radius: 10px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    flex-shrink: 0;
}

.info-icon {
    font-size: 18px;
}

.info-content {
    flex: 1;
    min-width: 0;
}

.info-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
    line-height: 1.2;
    word-break: break-word;
}

.info-label {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.7);
    margin-top: 2px;
}

.join-button {
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.25px;
    min-height: 44px;
}

.button-text {
    font-size: 0.875rem;
    font-weight: 500;
}

/* Mobile-first responsive design */
@media (max-width: 600px) {
    .coming-soon-chip {
        top: 8px;
        right: 8px;
        padding: 2px 6px;
        height: 24px;
    }
    
    .chip-text {
        font-size: 0.65rem;
    }
    
    .hero-title {
        font-size: 1.25rem;
        padding-bottom: 12px;
        padding-left: 16px;
    }
    
    .webinar-title {
        font-size: 1.125rem;
    }
    
    .webinar-description {
        font-size: 0.875rem;
        line-height: 1.5;
    }
    
    .info-item {
        gap: 6px;
    }
    
    .info-icon-wrapper {
        min-width: 32px;
        height: 32px;
        padding: 5px;
        border-radius: 8px;
    }
    
    .info-icon {
        font-size: 16px;
    }
    
    .info-value {
        font-size: 0.8rem;
    }
    
    .info-label {
        font-size: 0.7rem;
    }
    
    .join-button {
        min-height: 40px;
    }
    
    .button-text {
        font-size: 0.8rem;
    }
}

/* Very small devices */
@media (max-width: 380px) {
    .coming-soon-chip {
        top: 6px;
        right: 6px;
        padding: 1px 4px;
        height: 22px;
    }
    
    .chip-text {
        font-size: 0.6rem;
    }
    
    .hero-title {
        font-size: 1.1rem;
        padding-left: 12px;
    }
    
    .webinar-title {
        font-size: 1rem;
    }
    
    .webinar-description {
        font-size: 0.8rem;
    }
    
    .info-icon-wrapper {
        min-width: 28px;
        height: 28px;
        padding: 4px;
    }
    
    .info-icon {
        font-size: 14px;
    }
    
    .info-value {
        font-size: 0.75rem;
    }
    
    .info-label {
        font-size: 0.65rem;
    }
    
    .join-button {
        min-height: 38px;
    }
    
    .button-text {
        font-size: 0.75rem;
    }
}

/* Extreme small devices */
@media (max-width: 320px) {
    .coming-soon-chip {
        max-width: 70px;
    }
    
    .chip-text {
        font-size: 0.55rem;
    }
    
    .hero-title {
        font-size: 1rem;
    }
    
    .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .info-icon-wrapper {
        min-width: 24px;
        height: 24px;
    }
    
    .info-icon {
        font-size: 12px;
    }
    
    .button-text {
        font-size: 0.7rem;
    }
}

/* Tablet */
@media (min-width: 601px) and (max-width: 960px) {
    .hero-title {
        font-size: 1.75rem;
    }
    
    .info-icon-wrapper {
        min-width: 40px;
        height: 40px;
    }
    
    .info-icon {
        font-size: 20px;
    }
    
    .info-value {
        font-size: 0.9rem;
    }
    
    .info-label {
        font-size: 0.8rem;
    }
}

/* Desktop */
@media (min-width: 961px) {
    .upcoming-webinar-card {
        min-height: 500px;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .info-icon-wrapper {
        min-width: 44px;
        height: 44px;
    }
    
    .info-icon {
        font-size: 22px;
    }
    
    .info-value {
        font-size: 1rem;
    }
    
    .info-label {
        font-size: 0.875rem;
    }
    
    .join-button {
        height: 48px;
    }
    
    .button-text {
        font-size: 1rem;
    }
}

/* Handle text truncation for very long content */
@media (max-width: 400px) {
    .info-value {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100px;
    }
}

/* Ensure touch-friendly targets */
@media (max-width: 960px) {
    .info-icon-wrapper {
        min-width: 32px;
        min-height: 32px;
    }
    
    .join-button {
        min-height: 44px;
        min-width: 44px;
    }
}
</style>