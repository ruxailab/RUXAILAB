<template>
  <div>
    <v-row class="start-screen pa-0 ma-0" align="center">
      <SessionBackdropMark position="absolute" />
      <v-col md="8" class="ma-5 pa-5">
        <img
          src="@/assets/logo_full_white.svg"
          alt="RUXAILAB"
          class="mb-10"
          style="max-width: 300px"
        />
        <h1 class="text-h2 font-weight-bold text-white">
          {{ test.testTitle }}
        </h1>
        <p class="text-body-1 mb-5 text-white text-justify">
          {{ truncateDescription(test.testDescription) }}
        </p>
        <v-btn
          color="white"
          variant="outlined"
          rounded
          size="x-large"
          :disabled="disabled"
          @click="startTest"
        >
          {{ $t('buttons.startTest') }}
        </v-btn>
        <v-alert
          v-if="alertMessage || alertDetails.length"
          type="error"
          variant="outlined"
          class="mt-4"
          color="white"
          style="
            background-color: rgba(255, 255, 255, 0.1);
            border-color: white;
          "
        >
          <span v-if="alertMessage" class="text-white d-block">
            {{ alertMessage }}
          </span>
          <ul v-if="alertDetails.length" class="start-screen__alert-details">
            <li
              v-for="(detail, index) in alertDetails"
              :key="index"
              class="text-white"
            >
              {{ detail }}
            </li>
          </ul>
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import SessionBackdropMark from '@/shared/components/SessionBackdropMark.vue'

// Props
defineProps({
  test: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  alertMessage: {
    type: String,
    default: '',
  },
  alertDetails: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['start'])

const truncateDescription = (description) => {
  if (!description || description.length <= 150) return description
  return `${description.slice(0, 147)}...`
}

// Methods
const startTest = () => emit('start')
</script>

<style scoped>
.start-screen {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(
    160deg,
    #00213f 0%,
    #1a2f4f 35%,
    #303f9f 100%
  );
  transition: opacity 8s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-screen.leaving,
.start-screen.leaving > *,
.start-screen.leaving::before {
  opacity: 0;
  transition-duration: 1.2s;
}

@keyframes subtleGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.start-screen.leaving::before {
  opacity: 0;
}

.start-screen__alert-details {
  margin: 8px 0 0;
  padding-left: 1.25rem;
}
</style>
