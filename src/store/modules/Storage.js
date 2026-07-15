/**
 * Storage Store Module
 * @module Storage
 */

import {
  increment,
  deleteField,
  writeBatch,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import { deleteStudyStorageFile } from '@/shared/services/studyStorageService'

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
    async removeFileReference({ commit }, file) {
      if (!file) return

      const batch = writeBatch(db)
      const hasBatchUpdates = await queueFileReferenceRemoval(batch, file)

      if (hasBatchUpdates) {
        await batch.commit()
        commit('ADD_DELETED_URL', file.url)
      }
    },

    async deleteFile({ commit, rootGetters }, file) {
      if (!file) return

      commit('SET_DELETING', true)
      try {
        const storagePath = getStoragePathFromDownloadUrl(file.url)
        const studyId = storagePath.split('/')[1]
        await deleteStudyStorageFile(studyId, storagePath)

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

        hasBatchUpdates =
          (await queueFileReferenceRemoval(batch, file)) || hasBatchUpdates

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

async function queueFileReferenceRemoval(batch, file) {
  let hasBatchUpdates = false

  if (
    file.answersDocId &&
    file.userDocId &&
    file.taskId !== undefined &&
    file.taskId !== null &&
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

  if (
    file.answerCollection === 'heuristicAnswers' &&
    file.answersDocId &&
    file.userDocId &&
    file.url
  ) {
    const answerRef = doc(db, 'answers', file.answersDocId)
    const answerSnapshot = await getDoc(answerRef)
    const heuristicAnswer =
      answerSnapshot.data()?.heuristicAnswers?.[file.userDocId]
    const { value: cleanedAnswer, changed } = removeHeuristicFileReferences(
      heuristicAnswer,
      file.url,
    )

    if (changed) {
      batch.update(answerRef, {
        [`heuristicAnswers.${file.userDocId}`]: cleanedAnswer,
      })
      hasBatchUpdates = true
    }
  }

  return hasBatchUpdates
}

function removeHeuristicFileReferences(value, deletedUrl) {
  if (Array.isArray(value)) {
    let changed = false
    const cleaned = value
      .map((item) => {
        const result = removeHeuristicFileReferences(item, deletedUrl)
        changed = changed || result.changed
        return result.value
      })
      .filter((item) => {
        const shouldKeep = item?.url !== deletedUrl
        changed = changed || !shouldKeep
        return shouldKeep
      })
    return { value: cleaned, changed }
  }

  if (!value || typeof value !== 'object') {
    return { value, changed: false }
  }

  let changed = false
  const cleaned = {}

  Object.entries(value).forEach(([key, child]) => {
    if (key === 'answerImageUrl' && child === deletedUrl) {
      changed = true
      return
    }

    if (key === 'imageSize' && value.answerImageUrl === deletedUrl) {
      changed = true
      return
    }

    const result = removeHeuristicFileReferences(child, deletedUrl)
    changed = changed || result.changed
    cleaned[key] = result.value
  })

  return { value: cleaned, changed }
}
