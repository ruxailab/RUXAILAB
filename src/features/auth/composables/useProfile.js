import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { showError, showSuccess } from '../../../shared/utils/toast'

export function useProfile() {
  const { t } = useI18n()

  const userprofile = ref({
    profileImage: null,
    username: null,
    contactNo: null,
    country: null,
  })

  const loading = ref(true)

  // Track blob URLs for cleanup
  const blobUrls = new Set()

  const fetchUserProfile = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        const db = getFirestore()
        const userDoc = await getDoc(doc(db, 'users', user.uid))

        if (userDoc.exists()) {
          const data = userDoc.data()
          userprofile.value = {
            profileImage: data.profileImage || '',
            username: data.username || null,
            contactNo: data.contactNo || null,
            country: data.country || null,
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      showError(t('profile.profileLoadFailed'))
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error(t('profile.noUserSignedIn'))
      }

      const db = getFirestore()
      const userDocRef = doc(db, 'users', user.uid)

      let finalProfileImage = profileData.profileImage

      // Handle image upload if there's a pending file
      if (profileData.pendingImageFile) {
        finalProfileImage = await uploadProfileImage(
          profileData.pendingImageFile,
        )
        if (!finalProfileImage) {
          throw new Error(t('profile.profileImageUploadFailed'))
        }
      } else if (
        profileData.profileImage === '' &&
        userprofile.value.profileImage
      ) {
        // User wants to remove the image
        await removeProfileImage()
        finalProfileImage = ''
      }

      // Update Firestore with all profile data
      await updateDoc(userDocRef, {
        username: profileData.username,
        contactNo: profileData.contactNo,
        country: profileData.country,
        profileImage: finalProfileImage,
      })

      // Update local state
      userprofile.value = {
        ...userprofile.value,
        username: profileData.username,
        contactNo: profileData.contactNo,
        country: profileData.country,
        profileImage: finalProfileImage,
      }

      showSuccess(t('profile.profileUpdatedSuccess'))
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      showError(t('profile.profileUpdateFailed'))
      return false
    }
  }

  const uploadProfileImage = async (file) => {
    let blobUrl = null

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error(t('profile.noUserSignedIn'))

      // Create blob URL for preview and track it
      blobUrl = URL.createObjectURL(file)
      blobUrls.add(blobUrl)

      // Compress and upload
      const compressedFile = await compressImage(file, 300, 0.6)
      const storage = getStorage()
      const storageReference = storageRef(storage, `profileImages/${user.uid}`)

      await uploadBytes(storageReference, compressedFile)
      const downloadURL = await getDownloadURL(storageReference)

      return downloadURL
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      // Always cleanup blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        blobUrls.delete(blobUrl)
      }
    }
  }

  const removeProfileImage = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error(t('profile.noUserSignedIn'))

      // Only try to delete if there's an existing image
      if (userprofile.value.profileImage) {
        const storage = getStorage()
        const storageReference = storageRef(
          storage,
          `profileImages/${user.uid}`,
        )

        try {
          await deleteObject(storageReference)
        } catch (error) {
          // Ignore error if file doesn't exist
          if (error.code !== 'storage/object-not-found') {
            throw error
          }
        }
      }

      return true
    } catch (error) {
      console.error('Error removing profile image:', error)
      throw error
    }
  }

  const compressImage = (file, maxWidth, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result

        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Resize if image is larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          // Use better image rendering for quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(
                  new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }),
                )
              } else {
                reject(new Error('Canvas to Blob conversion failed'))
              }
            },
            'image/jpeg',
            quality,
          )
        }

        img.onerror = () => reject(new Error('Image load failed'))
      }

      reader.onerror = () => reject(new Error('FileReader error'))
    })
  }

  // Cleanup function to revoke all blob URLs
  const cleanup = () => {
    blobUrls.forEach((url) => URL.revokeObjectURL(url))
    blobUrls.clear()
  }

  return {
    userprofile,
    loading,
    fetchUserProfile,
    updateProfile,
    cleanup, // Export cleanup function
  }
}
