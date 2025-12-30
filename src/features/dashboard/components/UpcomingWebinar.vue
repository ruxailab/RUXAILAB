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
  <v-card elevation="2" rounded="lg" class="upcoming-webinar-card position-relative">
    <!-- Status Overlay -->
    <div v-if="webinarStatus.show" class="coming-soon-overlay">
      <v-chip :color="webinarStatus.color" variant="elevated" size="small" class="coming-soon-chip"
        :class="{ 'pulse-animation': webinarStatus.text === 'Live' }">
        <v-icon v-if="webinarStatus.icon" :icon="webinarStatus.icon" size="16" class="mr-1" />
        {{ webinarStatus.text }}
      </v-chip>
    </div>

    <!-- Hero Image Section -->
    <v-img class="align-end text-white" height="200" :src="officeHoursImage" cover>
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
      <v-row class="info-row mb-4" no-gutters>
        <v-col cols="6" class="pr-2">
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon icon="mdi-calendar" size="24" color="primary" />
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
              <div>Date</div>
            </div>
          </div>
        </v-col>
        <v-col cols="6" class="">
          <div class="info-item">
            <div class="info-icon-wrapper">
              <v-icon icon="mdi-clock-outline" size="24" color="primary" />
            </div>
            <div class="info-content">
              <div class="info-value">
                {{ webinar.duration }}
              </div>
              <div class="info-label">Time</div>
              <div>Time</div>
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
      <v-btn :color="buttonConfig.color" variant="flat" size="large" block rounded="lg" class="join-button"
        :prepend-icon="buttonConfig.icon" :disabled="buttonConfig.disabled" @click="buttonConfig.action">
        {{ buttonConfig.text }}
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
import { computed } from 'vue'
import officeHoursImage from '@/assets/office_banner_gray.png'

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
    const data = { ...props.webinarData }
    console.log(data)
    // Timestamp to Date
    if (data.date && typeof data.date.toDate === 'function') {
      const dateObj = data.date.toDate()
      data.dateObj = dateObj // Store original date object
      // Format date with day, month, and year
      data.date = dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      })
      // Format time
      data.duration = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
    return data
  }

  // Default webinar data
  return {
    title: 'Monthly Office Hours',
    description: 'Starting in November, we will host monthly office hours to discuss project updates, answer questions, and connect with our community.',
    date: 'Nov 2025',
    duration: 'Monthly'
  }
})

const webinarStatus = computed(() => {
  if (!webinar.value.dateObj) {
    return { show: true, text: 'Coming Soon', color: 'primary', icon: 'mdi-clock-outline' }
  }

  const now = new Date()
  const webinarDate = webinar.value.dateObj
  const diffMs = webinarDate - now
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  // If webinar has ended (more than 1 hour after start)
  if (diffHours < -1) {
    return { show: true, text: 'Ended', color: 'grey', icon: 'mdi-check-circle' }
  }

  // If webinar is happening now (within 1 hour after start)
  if (diffHours <= 0 && diffHours >= -1) {
    return { show: true, text: 'Live', color: 'error', icon: 'mdi-access-point' }
  }

  // If less than 24 hours
  if (diffHours > 0 && diffHours < 24) {
    return { show: true, text: 'Today', color: 'warning', icon: 'mdi-calendar-today' }
  }

  // If less than a week (7 days)
  if (diffDays >= 1 && diffDays < 7) {
    return { show: true, text: 'Coming Soon', color: 'primary', icon: 'mdi-clock-outline' }
  }

  // Don't show chip if more than a week away
  return { show: false, text: '', color: 'primary', icon: '' }
})

const buttonConfig = computed(() => {
  const status = webinarStatus.value.text
  const link = webinar.value.link || webinar.value.url || 'https://discord.com/channels/1209902463239593984/1451552153251348592'

  if (status === 'Live') {
    return {
      text: 'Join Now',
      icon: 'mdi-video',
      color: 'error',
      disabled: false,
      action: () => window.open(link, '_blank')
    }
  }

  if (status === 'Ended') {
    return {
      text: 'Webinar Ended',
      icon: 'mdi-check-circle',
      color: 'grey',
      disabled: true,
      action: () => { }
    }
  }

  if (status === 'Today') {
    return {
      text: 'Starting Today',
      icon: 'mdi-calendar-clock',
      color: 'warning',
      disabled: true,
      action: () => { }
    }
  }

  return {
    text: 'Coming Soon',
    icon: 'mdi-calendar-clock',
    color: 'primary',
    disabled: true,
    action: () => { }
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
  position: relative;
}

.coming-soon-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
}

.coming-soon-chip {
  font-weight: 600;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.webinar-hero {
  background: linear-gradient(135deg, #e8e3ff 0%, #d4c5ff 100%);
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
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
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon-wrapper {
  background-color: rgb(var(--v-theme-primary), 0.1);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
}

.info-content {
  flex: 1;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.info-label {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 2px;
}

.join-button {
  font-weight: 600;
  height: 48px;
  font-size: 1rem;
  text-transform: none;
  letter-spacing: 0.25px;
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
  .webinar-hero {
    height: 160px;
    padding: 16px;
  }

  .character-avatar {
    width: 100px !important;
    height: 100px !important;
  }

  .webinar-title {
    font-size: 1.25rem;
  }
}
</style>