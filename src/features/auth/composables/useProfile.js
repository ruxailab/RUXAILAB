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
      console.log('updateProfile: Starting...', profileData)
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error(t('profile.noUserSignedIn'))
      }

      console.log('updateProfile: User authenticated:', user.uid)
      const db = getFirestore()
      const userDocRef = doc(db, 'users', user.uid)

      let finalProfileImage = profileData.profileImage

      // Handle image upload if there's a pending file
      if (profileData.pendingImageFile) {
        console.log('updateProfile: Uploading image file...', profileData.pendingImageFile)
        finalProfileImage = await uploadProfileImage(
          profileData.pendingImageFile,
        )
        console.log('updateProfile: Image uploaded, URL:', finalProfileImage)
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

  // Convert file to Base64 data URL (bypasses Firebase Storage - works on free plan)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const uploadProfileImage = async (file) => {
    try {
      console.log('uploadProfileImage: Starting...', file.name, file.type, file.size)
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error(t('profile.noUserSignedIn'))

      // Compress the image first
      console.log('uploadProfileImage: Starting compression...')
      const compressedFile = await compressImage(file, 300, 0.6)
      console.log('uploadProfileImage: Compression done, file size:', compressedFile.size)
      
      // Convert to Base64 (stores directly in Firestore, no Storage needed!)
      console.log('uploadProfileImage: Converting to Base64...')
      const base64DataUrl = await fileToBase64(compressedFile)
      console.log('uploadProfileImage: Base64 conversion complete, length:', base64DataUrl.length)

      // Return the Base64 data URL (this will be stored in Firestore)
      return base64DataUrl
    } catch (error) {
      console.error('uploadProfileImage: Error:', error)
      throw error
    }
  }

  const removeProfileImage = async () => {
    // With Base64 storage in Firestore, we just need to set profileImage to ''
    // The actual removal happens in updateProfile when it saves the empty string
    console.log('removeProfileImage: Image will be cleared from Firestore on save')
    return true
  }

  const compressImage = (file, maxWidth, quality) => {
    return new Promise((resolve, reject) => {
      // Add a timeout to prevent infinite hangs
      const timeout = setTimeout(() => {
        console.error('compressImage: Timeout after 10 seconds')
        reject(new Error('Image compression timed out'))
      }, 10000)

      console.log('compressImage: Starting compression for', file.name, file.type, file.size)

      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = (event) => {
        console.log('compressImage: FileReader loaded, data URL length:', event.target.result.length)
        const img = new Image()
        img.src = event.target.result

        img.onload = () => {
          console.log('compressImage: Image loaded, dimensions:', img.width, 'x', img.height)
          clearTimeout(timeout)
          
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
                console.log('compressImage: Compression complete, blob size:', blob.size)
                resolve(
                  new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }),
                )
              } else {
                console.error('compressImage: Canvas to Blob conversion failed')
                reject(new Error('Canvas to Blob conversion failed'))
              }
            },
            'image/jpeg',
            quality,
          )
        }

        img.onerror = (error) => {
          clearTimeout(timeout)
          console.error('compressImage: Image load failed', error)
          reject(new Error('Image load failed'))
        }
      }

      reader.onerror = (error) => {
        clearTimeout(timeout)
        console.error('compressImage: FileReader error', error)
        reject(new Error('FileReader error'))
      }
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
