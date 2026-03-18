import { ref } from 'vue'
import { showSuccess, showError } from '@/shared/utils/toast'
import { useI18n } from 'vue-i18n'

export function useCopyLink() {
  const { t } = useI18n()
  const fallbackDialogVisible = ref(false)
  const fallbackUrl = ref('')

  const copyTestLink = async (testId) => {
    const url = `${window.location.origin}/testview/${testId}`

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url)
        showSuccess(t('common.copyLink.success'))
        return
      } catch {
        // fall through to fallback
      }
    }

    // Fallback: show dialog with selectable URL
    fallbackUrl.value = url
    fallbackDialogVisible.value = true
    showError(t('common.copyLink.error'))
  }

  return {
    copyTestLink,
    fallbackDialogVisible,
    fallbackUrl,
  }
}