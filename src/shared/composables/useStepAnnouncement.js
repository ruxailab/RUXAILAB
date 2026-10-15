import { nextTick, ref } from 'vue'
import { animateStepAnnouncement } from '@/shared/utils/animations'

export function useStepAnnouncement(options = {}) {
  const showStepAnnouncement = ref(false)
  const nextStepAnnouncementTitle = ref('')
  const nextStepAnnouncementKicker = ref('')
  const stepAnnouncementOverlay = ref(null)

  const scrollToTop = () => {
    if (typeof options.onScroll === 'function') {
      options.onScroll()
      return
    }

    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      })
    } catch {
      // jsdom does not implement window.scrollTo
    }

    const target =
      typeof options.scrollTarget === 'function' ? options.scrollTarget() : null
    const element = target?.$el ?? target
    if (element) element.scrollTop = 0
  }

  const announce = async (title, stageNumber, kickerOverride = '') => {
    if (options.scroll) scrollToTop()

    nextStepAnnouncementKicker.value = kickerOverride || `Stage ${stageNumber}`
    nextStepAnnouncementTitle.value = title
    showStepAnnouncement.value = true

    const safetyHideTimer = window.setTimeout(() => {
      showStepAnnouncement.value = false
    }, 4200)

    try {
      await nextTick()
      await animateStepAnnouncement(stepAnnouncementOverlay.value, {
        totalDuration: 3,
      })
    } finally {
      window.clearTimeout(safetyHideTimer)
      showStepAnnouncement.value = false

      if (options.scroll) {
        await nextTick()
        scrollToTop()
      }
    }
  }

  const safelyAnnounce = async (title, stageNumber, kickerOverride = '') => {
    try {
      await announce(title, stageNumber, kickerOverride)
    } catch {
      showStepAnnouncement.value = false
    }
  }

  return {
    showStepAnnouncement,
    nextStepAnnouncementTitle,
    nextStepAnnouncementKicker,
    stepAnnouncementOverlay,
    announce,
    safelyAnnounce,
  }
}
