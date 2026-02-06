import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
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
    } catch {
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
    } catch {
      showError(t('profile.profileUpdateFailed'))
      return false
    }
  }

  // Convert file to Base64 data URL (bypasses Firebase Storage - works on free plan)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const uploadProfileImage = async (file) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error(t('profile.noUserSignedIn'))

      // Compress the image first

      const compressedFile = await compressImage(file, 300, 0.6)

      // Convert to Base64 (stores directly in Firestore, no Storage needed!)

      const base64DataUrl = await fileToBase64(compressedFile)

      // Return the Base64 data URL (this will be stored in Firestore)
      return base64DataUrl
    } catch (error) {
      throw error
    }
  }

  const removeProfileImage = async () => {
    // With Base64 storage in Firestore, we just need to set profileImage to ''
    // The actual removal happens in updateProfile when it saves the empty string

    return true
  }

  // Helper function to load image from data URL
  const loadImage = (dataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = dataUrl
    })
  }

  // Helper function to convert canvas to File
  const canvasToFile = (canvas, fileName, quality) => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(
              new File([blob], fileName, {
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
    })
  }

  const compressImage = async (file, maxWidth, quality) => {
    // Read file as data URL
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('FileReader error'))
      reader.readAsDataURL(file)
    })

    // Load image
    const img = await loadImage(dataUrl)

    // Create canvas and resize
    const canvas = document.createElement('canvas')
    let width = img.width
    let height = img.height

    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)

    // Convert to file
    const compressedFile = await canvasToFile(canvas, file.name, quality)

    return compressedFile
  }

  return {
    userprofile,
    loading,
    fetchUserProfile,
    updateProfile,
  }
}
