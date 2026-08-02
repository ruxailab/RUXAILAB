<template>
  <div class="session-timer" :class="stateClass">
    <v-icon size="16">mdi-timer-outline</v-icon>
    <span class="session-timer__time">{{ display }}</span>

    <template v-if="isFacilitator">
      <button
        type="button"
        class="session-timer__btn"
        :title="running ? t('focusGroup.session.pauseTimer') : t('focusGroup.session.startTimer')"
        @click="toggle"
      >
        <v-icon size="16">{{ running ? 'mdi-pause' : 'mdi-play' }}</v-icon>
      </button>
      <button
        type="button"
        class="session-timer__btn"
        :title="t('focusGroup.session.resetTimer')"
        @click="emit('reset')"
      >
        <v-icon size="16">mdi-restart</v-icon>
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // RTDB timer for the current topic, or null. { running, endsAt, remainingMs }
  timer: { type: Object, default: null },
  // The topic's planned duration, shown when no timer has been started yet.
  fallbackMs: { type: Number, default: 0 },
  isFacilitator: { type: Boolean, default: false },
})

const emit = defineEmits(['play', 'pause', 'reset'])

// A local 1s tick drives the live countdown; the timer syncs via `endsAt`, so no
// writes happen per second — only on the facilitator's play/pause/reset.
const now = ref(Date.now())
let ticker = null
onMounted(() => {
  ticker = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
})

const running = computed(() => props.timer?.running === true)

const remainingMs = computed(() => {
  if (props.timer) {
    if (running.value && props.timer.endsAt)
      return Math.max(0, props.timer.endsAt - now.value)
    if (props.timer.remainingMs != null)
      return Math.max(0, props.timer.remainingMs)
  }
  return Math.max(0, props.fallbackMs)
})

const display = computed(() => {
  const total = Math.ceil(remainingMs.value / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const overdue = computed(() => remainingMs.value <= 0)
const warning = computed(() => !overdue.value && remainingMs.value <= 60000)
const stateClass = computed(() => ({
  'session-timer--running': running.value && !warning.value && !overdue.value,
  'session-timer--warning': warning.value && running.value,
  'session-timer--overdue': overdue.value,
}))

const toggle = () => {
  if (running.value) emit('pause', remainingMs.value)
  else emit('play', remainingMs.value)
}
</script>

<style scoped>
.session-timer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.session-timer--running {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}

.session-timer--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.14);
}

.session-timer--overdue {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.14);
}

.session-timer__time {
  min-width: 34px;
  text-align: center;
}

.session-timer__btn {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: inherit;
  transition: background 0.15s ease;
}

.session-timer__btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.12);
}
</style>
