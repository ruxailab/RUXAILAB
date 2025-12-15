import { useToast } from 'vue-toastification'
import i18n from '@/app/plugins/i18n'

/**
 * Shared Toast Notification Utility
 * Centralizes toast logic and i18n resolution.
 */
export const useNotification = () => {
    const toast = useToast()

    /**
     * Helper to resolve message:
     * Checks if the message is a translation key.
     */
    const getMessage = (keyOrMessage, params = {}) => {
        if (!keyOrMessage) return ''

        // Access global i18n methods
        const { t, te } = i18n.global

        // Check if the key exists in translation files
        // Note: 'te' checks if translation exists, 't' translates it
        if (te && te(keyOrMessage)) {
            return t(keyOrMessage, params)
        }

        // If it's not a known key, return the string as is
        return keyOrMessage
    }

    const showSuccess = (message, params = {}) => {
        toast.success(getMessage(message, params))
    }

    const showError = (message, params = {}) => {
        toast.error(getMessage(message, params))
    }

    const showInfo = (message, params = {}) => {
        toast.info(getMessage(message, params))
    }

    const showWarning = (message, params = {}) => {
        toast.warning(getMessage(message, params))
    }

    return {
        showSuccess,
        showError,
        showInfo,
        showWarning
    }
}