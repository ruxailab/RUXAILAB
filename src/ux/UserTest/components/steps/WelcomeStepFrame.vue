<template>
  <section class="welcome-step-frame">
    <div class="welcome-step-frame__content">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

let backgroundElement = null

onMounted(() => {
  const existingBackground = document.getElementById(
    'welcome-step-frame-background',
  )

  if (existingBackground) {
    backgroundElement = existingBackground
    return
  }

  backgroundElement = document.createElement('div')
  backgroundElement.id = 'welcome-step-frame-background'
  backgroundElement.className = 'welcome-step-frame__background'
  backgroundElement.setAttribute('aria-hidden', 'true')
  Object.assign(backgroundElement.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2',
    height: '140%',
    marginRight: '-450px',
    marginTop: '100px',
    backgroundImage: `url(${new URL('../../../../assets/logo_small_red.png', import.meta.url).href})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'right top',
    opacity: '0.2',
    pointerEvents: 'none',
  })
  document.body.appendChild(backgroundElement)
})
</script>

<style scoped>
.welcome-step-frame {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
  background: transparent;
}

.welcome-step-frame__background {
  display: none;
}

.welcome-step-frame__content {
  position: relative;
  z-index: 10;
  width: 100%;
  min-height: inherit;
  background: transparent;
}

@media (max-width: 960px) {
  .welcome-step-frame {
    min-height: auto;
    overflow: visible;
  }

  .welcome-step-frame__content {
    min-height: auto;
  }
}
</style>
