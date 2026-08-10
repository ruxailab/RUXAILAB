<template>
  <output class="step-announcement-overlay" aria-live="polite">
    <div class="step-announcement-layout">
      <img :src="logoSrc" alt="RUXAILAB" class="step-announcement-logo mb-10" />

      <div class="step-announcement-card">
        <h1 class="text-h2 font-weight-300 text-white">
          {{ title }}
        </h1>
        <p class="text-body mb-5 text-white text-justify">
          {{ kicker }}
        </p>
      </div>
    </div>
  </output>
</template>

<script setup>
import logoSrc from '@/assets/logo_full_white.png'

defineProps({
  title: {
    type: String,
    default: '',
  },
  kicker: {
    type: String,
    default: 'Next step',
  },
})
</script>

<style scoped>
.step-announcement-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  padding: 0;
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(
    160deg,
    #00213f 0%,
    #1a2f4f 35%,
    #303f9f 100%
  );
}

.step-announcement-overlay::before {
  content: '';
  position: absolute;
  z-index: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140%;
  margin-right: -450px;
  margin-top: 100px;
  background-image: url(../../../assets/logo_small_red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
  pointer-events: none;
}

.step-announcement-layout {
  position: relative;
  z-index: 1;
  width: min(980px, 92vw);
  margin: 40px;
  padding: 40px;
}

.step-announcement-logo {
  width: min(300px, 62vw);
  margin-bottom: 24px;
}

.step-announcement-card {
  width: min(820px, 92vw);
  text-align: left;
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

@media (max-width: 960px) {
  .step-announcement-layout {
    margin: 16px;
    padding: 24px;
  }

  .step-announcement-card {
    width: 100%;
  }
}
.text-body {
  font-size: 1.625rem;
  font-weight: 300;
}
</style>
