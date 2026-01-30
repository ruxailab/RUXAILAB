/**
 * Vuex module for managing media recordings.
 *
 * @namespace mediaRecorder
 * @property {boolean} namespaced - When set to true, this module operates in a namespaced scope,
 *                                  preventing naming conflicts with other modules. Without namespacing,
 *                                  all getters, mutations, and actions would be registered in the global
 *                                  namespace, causing potential collisions. With namespacing enabled,
 *                                  you must reference items with the module prefix (e.g., 'mediaRecorder/SET_MEDIA_BLOB'
 *                                  instead of just 'SET_MEDIA_BLOB').
 *
 * @property {Object} state - Module state object
 * @property {Object} state.recordings - Dictionary storing media blobs indexed by task and media type
 *
 * @property {Object} getters - Module getters
 * @property {Function} getters.allRecordings - Returns all recordings from state
 * @property {Function} getters.hasPendingMedia - Returns true if there are any pending recordings
 *
 * @property {Object} mutations - Module mutations
 * @property {Function} mutations.SET_MEDIA_BLOB - Sets a media blob for a specific task and media type
 * @property {Function} mutations.CLEAR_MEDIA - Clears all recordings from state
 */

import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

export default {
  namespaced: true,

  state: () => ({
    recordings: {},
    urls: {},
  }),

  getters: {
    allRecordings(state) {
      return state.recordings
    },

    hasPendingMedia(state) {
      return Object.keys(state.recordings).length > 0
    },

    mediaUrls(state) {
      return state.urls
    },
  },

  mutations: {
    SET_MEDIA_BLOB(state, { taskIndex, mediaType, blob }) {
      if (!state.recordings[taskIndex]) {
        state.recordings[taskIndex] = {}
      }
      state.recordings[taskIndex][mediaType] = blob
    },

    SET_MEDIA_URL(state, { taskIndex, mediaType, url }) {
      if (!state.urls[taskIndex]) {
        state.urls[taskIndex] = {}
      }
      state.urls[taskIndex][mediaType] = url
    },

    CLEAR_MEDIA(state) {
      state.recordings = {}
    },
  },
  actions: {
    async uploadMedia({ state, commit }, { testId }) {
      const storage = getStorage()

      for (const [taskIndex, medias] of Object.entries(state.recordings)) {
        for (const [mediaType, blob] of Object.entries(medias)) {
          if (!blob) continue

          const path = `tests/${testId}/tasks/${taskIndex}/${mediaType}.webm`
          const fileRef = ref(storage, path)

          await uploadBytes(fileRef, blob)
          const url = await getDownloadURL(fileRef)

          commit('SET_MEDIA_URL', {
            taskIndex,
            mediaType,
            url,
          })
        }
      }
    },
  },
}
