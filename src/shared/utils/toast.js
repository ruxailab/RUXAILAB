import { useToast } from 'vue-toastification'
import i18n from '@/app/plugins/i18n'

const toast = useToast()

function resolveMessage(message) {
  if (!message) return ''

  if (typeof message === 'string' && message.includes('.') && i18n.global.te(message)) {
    return i18n.global.t(message)
  }

  return message
}

// Default
export const showToast = (message, options = {}) => {
  toast(resolveMessage(message), options)
}

export const showSuccess = (message, options = {}) => {
  toast.success(resolveMessage(message), options)
}

export const showError = (message, options = {}) => {
  toast.error(resolveMessage(message), options)
}

export const showInfo = (message, options = {}) => {
  toast.info(resolveMessage(message), options)
}

export const showWarning = (message, options = {}) => {
  toast.warning(resolveMessage(message), options)
}
