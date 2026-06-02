/**
 * Storage Store Module
 * @module Storage
 */

import { getStorage, ref as storageRef, deleteObject } from 'firebase/storage'
import { increment, deleteField, writeBatch, doc } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'

export default {
  namespaced: true,

  state: {
    deleting: false,
    deletedUrls: new Set(),
  },

  getters: {
    isDeleting: (state) => state.deleting,
    deletedUrls: (state) => state.deletedUrls,
  },

  mutations: {
    SET_DELETING(state, payload) {
      state.deleting = payload
    },
    ADD_DELETED_URL(state, url) {
      state.deletedUrls.add(url)
    },
    RESET_DELETED_URLS(state) {
      state.deletedUrls.clear()
    },
  },

  actions: {
    async deleteFile({ commit, rootGetters }, file) {
      if (!file) return

      commit('SET_DELETING', true)
      try {
        const storage = getStorage()
        const storagePath = getStoragePathFromDownloadUrl(file.url)
        const fileRef = storageRef(storage, storagePath)
        await deleteObject(fileRef)

        commit('ADD_DELETED_URL', file.url)

        const batch = writeBatch(db)
        let hasBatchUpdates = false

        const currentUser = rootGetters.user
        if (currentUser?.id && file.size > 0) {
          const deltaMB = file.size / (1024 * 1024)
          const userRef = doc(db, 'users', currentUser.id)
          batch.update(userRef, {
            storageUsageMB: increment(-deltaMB),
          })
          hasBatchUpdates = true

          const updatedStorageMB = Math.max(
            0,
            (currentUser.storageUsageMB || 0) - deltaMB,
          )
          commit(
            'SET_USER',
            {
              ...currentUser,
              storageUsageMB: updatedStorageMB,
            },
            { root: true },
          )
        }

        if (
          file.answersDocId &&
          file.userDocId &&
          file.taskId &&
          file.urlField
        ) {
          const fieldPath = `taskAnswers.${file.userDocId}.tasks.${file.taskId}.${file.urlField}`
          const updatePayload = {
            [fieldPath]: deleteField(),
          }
          if (file.sizeField) {
            updatePayload[
              `taskAnswers.${file.userDocId}.tasks.${file.taskId}.${file.sizeField}`
            ] = deleteField()
          }
          const answerRef = doc(db, 'answers', file.answersDocId)
          batch.update(answerRef, updatePayload)
          hasBatchUpdates = true
        }

        if (hasBatchUpdates) {
          await batch.commit()
        }
      } catch (error) {
        console.error('Error deleting file:', error)
        throw error
      } finally {
        commit('SET_DELETING', false)
      }
    },
  },
}

function getStoragePathFromDownloadUrl(downloadUrl) {
  const match = downloadUrl.match(/\/o\/([^?]+)/)
  if (!match)
    throw new Error(`Cannot parse storage path from URL: ${downloadUrl}`)
  return decodeURIComponent(match[1])
}
