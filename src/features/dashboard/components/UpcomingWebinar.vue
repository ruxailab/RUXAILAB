<template>
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


    <v-card-text class="pa-6">
      <!-- Webinar Title -->
      <h2 class="webinar-title text-h5 font-weight-bold">
        {{ webinar.title }}
      </h2>

      <!-- Webinar Description -->
      <p class="webinar-description text-body-1 text-grey-darken-1 mb-4">
        {{ webinar.description }}
      </p>

      <!-- Date and Duration Info -->
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
              <div>Time</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Join Button -->
      <v-btn :color="buttonConfig.color" variant="flat" size="large" block rounded="lg" class="join-button"
        :prepend-icon="buttonConfig.icon" :disabled="buttonConfig.disabled" @click="buttonConfig.action">
        {{ buttonConfig.text }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import officeHoursImage from '@/assets/office_banner_gray.png'

const props = defineProps({
  webinarData: {
    type: Object,
    default: () => ({})
  }
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



.info-item {
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

/* Responsive adjustments */
@media (max-width: 600px) {
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
