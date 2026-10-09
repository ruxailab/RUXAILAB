<template>
  <div
    class="session-backdrop-mark"
    :class="{ 'session-backdrop-mark--absolute': position === 'absolute' }"
    aria-hidden="true"
  />
</template>

<script setup>
defineProps({
  position: {
    type: String,
    default: 'fixed',
    validator: (value) => ['fixed', 'absolute'].includes(value),
  },
})
</script>

<style scoped>
.session-backdrop-mark {
  position: fixed;
  z-index: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140%;
  margin-right: -450px;
  margin-top: 100px;
  background-image: url(../../assets/logo_small_red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
  pointer-events: none;
}

.session-backdrop-mark--absolute {
  position: absolute;
}
</style>

<style>
.session-backdrop {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.session-backdrop-content {
  position: relative;
  z-index: 1;
}
</style>
