/**
 * Loading state management composable
 * Centralized loading state handling to eliminate duplication across components
 */

import { ref } from 'vue'

/**
 * Composable for managing loading states
 * @returns {object} Loading state and utilities
 */
export function useLoading() {
  const isLoading = ref(false)

  /**
   * Execute an async function with loading state management
   * @param {Function} asyncFn - Async function to execute
   * @returns {Promise} Result of the async function
   */
  const withLoading = async (asyncFn) => {
    isLoading.value = true
    try {
      return await asyncFn()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Manually set loading state
   * @param {boolean} value - Loading state value
   */
  const setLoading = (value) => {
    isLoading.value = value
  }

  /**
   * Start loading
   */
  const startLoading = () => {
    isLoading.value = true
  }

  /**
   * Stop loading
   */
  const stopLoading = () => {
    isLoading.value = false
  }

  return {
    isLoading,
    withLoading,
    setLoading,
    startLoading,
    stopLoading,
  }
}

/**
 * Multiple loading states composable
 * For components that need to track multiple loading operations
 * @returns {object} Multiple loading states and utilities
 */
export function useMultipleLoading() {
  const loadingStates = ref({})

  /**
   * Set loading state for a specific key
   * @param {string} key - Loading state key
   * @param {boolean} value - Loading state value
   */
  const setLoading = (key, value) => {
    loadingStates.value[key] = value
  }

  /**
   * Get loading state for a specific key
   * @param {string} key - Loading state key
   * @returns {boolean} Loading state
   */
  const isLoading = (key) => {
    return loadingStates.value[key] || false
  }

  /**
   * Check if any loading state is active
   * @returns {boolean} True if any loading state is active
   */
  const isAnyLoading = () => {
    return Object.values(loadingStates.value).some((state) => state)
  }

  /**
   * Execute an async function with loading state management for a specific key
   * @param {string} key - Loading state key
   * @param {Function} asyncFn - Async function to execute
   * @returns {Promise} Result of the async function
   */
  const withLoading = async (key, asyncFn) => {
    setLoading(key, true)
    try {
      return await asyncFn()
    } finally {
      setLoading(key, false)
    }
  }

  /**
   * Clear all loading states
   */
  const clearAll = () => {
    loadingStates.value = {}
  }

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    clearAll,
  }
}
