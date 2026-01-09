<template>
  <div class="password-strength mb-4" v-if="password">
    <div class="d-flex justify-space-between align-center mb-1">
      <span class="text-caption text-medium-emphasis">{{ $t('auth.passwordStrength') }}</span>
      <span class="text-caption font-weight-bold" :class="colorTextClass">{{ strengthLabel }}</span>
    </div>
    <v-progress-linear
      :model-value="progressValue"
      :color="strengthColor"
      height="6"
      rounded
      class="strength-bar"
    ></v-progress-linear>
    
    <div class="d-flex flex-column gap-2 mt-2">
      <div v-for="(req, index) in requirements" :key="index" class="d-flex align-center">
        <v-icon :color="req.met ? 'success' : 'grey-darken-1'" size="small" class="mr-1">
          {{ req.met ? 'mdi-check-circle' : 'mdi-circle-outline' }}
        </v-icon>
        <span class="text-caption" :class="req.met ? 'text-success' : 'text-medium-emphasis'">{{ req.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  password: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()

// Requirements logic
const requirements = computed(() => [
  { label: t('profile.passwordMinLength') || '8+ chars', met: props.password.length >= 8 },
  { label: t('auth.number') || 'Number', met: /\d/.test(props.password) },
  { label: t('profile.passwordUppercase') || 'Uppercase', met: /[A-Z]/.test(props.password) },
  { label: t('profile.passwordSymbol') || 'Symbol', met: /[!@#$%^&*(),.?":{}|<>]/.test(props.password) },
])

const score = computed(() => {
  return requirements.value.filter(r => r.met).length
})

const strengthLabel = computed(() => {
  if (score.value === 0) return t('auth.strength.veryWeak') || 'Very Weak'
  if (score.value === 1) return t('auth.strength.weak') || 'Weak'
  if (score.value === 2) return t('auth.strength.fair') || 'Fair'
  if (score.value === 3) return t('auth.strength.good') || 'Good'
  return t('auth.strength.strong') || 'Strong'
})

const strengthColor = computed(() => {
  if (score.value <= 1) return 'error'
  if (score.value === 2) return 'warning'
  if (score.value === 3) return 'info'
  return 'success'
})

const colorTextClass = computed(() => {
  return `text-${strengthColor.value}`
})

const progressValue = computed(() => {
  if (props.password.length === 0) return 0
  return (score.value / 4) * 100
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
