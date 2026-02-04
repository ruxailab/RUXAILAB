import axios from 'axios'

/**
 * Standardized error response format
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} message - User-friendly error message
 * @property {string} [code] - Error code for programmatic handling
 * @property {*} [data] - Additional error data
 */

/**
 * Configuration for axios instance
 */
const AXIOS_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'],
}

/**
 * Create axios instance with custom configuration
 */
const axiosInstance = axios.create(AXIOS_CONFIG)

/**
 * Determine if an error is retryable
 * @param {Error} error - Axios error object
 * @returns {boolean} - Whether the error is retryable
 */
const isRetryableError = (error) => {
  if (!error.config) {
    return false
  }

  // Check for network errors
  if (error.code && RETRY_CONFIG.retryableErrors.includes(error.code)) {
    return true
  }

  // Check for retryable HTTP status codes
  if (
    error.response &&
    RETRY_CONFIG.retryableStatuses.includes(error.response.status)
  ) {
    return true
  }

  return false
}

/**
 * Calculate exponential backoff delay
 * @param {number} retryCount - Current retry attempt
 * @returns {number} - Delay in milliseconds
 */
const getRetryDelay = (retryCount) => {
  return RETRY_CONFIG.retryDelay * Math.pow(2, retryCount - 1)
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Request interceptor
 * Adds retry count to config
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Initialize retry count
    config._retryCount = config._retryCount || 0
    return config
  },
  (error) => {
    throw error
  },
)

/**
 * Response interceptor with retry logic
 * Handles errors and implements retry mechanism
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const config = error.config

    // If config doesn't exist or retry is disabled, reject immediately
    if (!config || config._noRetry) {
      throw standardizeError(error)
    }

    // Check if we should retry
    if (
      isRetryableError(error) &&
      config._retryCount < RETRY_CONFIG.maxRetries
    ) {
      config._retryCount += 1

      // Calculate delay with exponential backoff
      const delay = getRetryDelay(config._retryCount)

      console.warn(
        `Retrying request (${config._retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms:`,
        config.url,
      )

      // Wait before retrying
      await sleep(delay)

      // Retry the request
      return axiosInstance(config)
    }

    // Max retries reached or not retryable, reject with standardized error
    throw standardizeError(error)
  },
)

/**
 * Standardize error format across all API calls
 * @param {Error} error - Original error object
 * @returns {ErrorResponse} - Standardized error response
 */
const standardizeError = (error) => {
  const standardError = {
    success: false,
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    data: null,
  }

  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const data = error.response.data

    standardError.code = `HTTP_${status}`
    standardError.data = data

    // Customize message based on status code
    switch (status) {
      case 400:
        standardError.message =
          data?.message || 'Invalid request. Please check your input.'
        break
      case 401:
        standardError.message =
          data?.message || 'Authentication required. Please log in.'
        break
      case 403:
        standardError.message =
          data?.message || 'Access denied. You do not have permission.'
        break
      case 404:
        standardError.message =
          data?.message || 'The requested resource was not found.'
        break
      case 408:
        standardError.message = 'Request timeout. Please try again.'
        break
      case 429:
        standardError.message = 'Too many requests. Please wait and try again.'
        break
      case 500:
        standardError.message =
          data?.message || 'Server error. Please try again later.'
        break
      case 502:
      case 503:
      case 504:
        standardError.message =
          'Service temporarily unavailable. Please try again later.'
        break
      default:
        standardError.message =
          data?.message || `Request failed with status ${status}`
    }
  } else if (error.request) {
    // Request made but no response received
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      standardError.code = 'TIMEOUT'
      standardError.message =
        'Request timed out. Please check your connection and try again.'
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ENETUNREACH') {
      standardError.code = 'NETWORK_ERROR'
      standardError.message =
        'Network error. Please check your internet connection.'
    } else {
      standardError.code = 'NO_RESPONSE'
      standardError.message =
        'No response from server. Please check your connection.'
    }
  } else {
    // Error in request setup
    standardError.code = 'REQUEST_ERROR'
    standardError.message = error.message || 'Failed to send request'
  }

  return standardError
}

/**
 * Create a wrapper for axios instance with additional utilities
 */
const httpClient = {
  /**
   * Standard axios instance
   */
  instance: axiosInstance,

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} config - Axios config
   * @returns {Promise} - Response promise
   */
  get: (url, config = {}) => axiosInstance.get(url, config),

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {*} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} - Response promise
   */
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {*} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} - Response promise
   */
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),

  /**
   * PATCH request
   * @param {string} url - Request URL
   * @param {*} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} - Response promise
   */
  patch: (url, data, config = {}) => axiosInstance.patch(url, data, config),

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {Object} config - Axios config
   * @returns {Promise} - Response promise
   */
  delete: (url, config = {}) => axiosInstance.delete(url, config),

  /**
   * Make request without retry logic
   * @param {Object} config - Axios config
   * @returns {Promise} - Response promise
   */
  noRetry: (config) => axiosInstance({ ...config, _noRetry: true }),

  /**
   * Update default timeout for all requests
   * @param {number} timeout - Timeout in milliseconds
   */
  setTimeout: (timeout) => {
    axiosInstance.defaults.timeout = timeout
  },

  /**
   * Update default headers
   * @param {Object} headers - Headers object
   */
  setHeaders: (headers) => {
    Object.assign(axiosInstance.defaults.headers, headers)
  },
}

export default httpClient
export { axiosInstance, standardizeError }
