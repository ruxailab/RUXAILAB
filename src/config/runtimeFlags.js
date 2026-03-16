/**
 * Centralized source of truth for runtime feature flags.
 * Used to toggle functionality based on environment variables.
 */

export const isFirebaseDisabled = process.env.VUE_APP_FIREBASE_DISABLED === 'true'
