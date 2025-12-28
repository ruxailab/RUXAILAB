import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage'

// Helper function moved outside to avoid deep nesting
async function compressImage(file, maxWidth, quality) {
  const dataUrl = await fileToDataURL(file)
  const img = await loadImage(dataUrl)
  const blob = await drawImageToBlob(img, maxWidth, quality)
  return new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

function drawImageToBlob(img, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    let { width, height } = img

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

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas to Blob conversion failed'))
      },
      'image/jpeg',
      quality
    )
  })
}

export function useProfile() {
  const { t } = useI18n()
  const toast = useToast()

  const userprofile = ref({
    profileImage: '',
    username: null,
    contactNo: null,
    country: null
  })

  const loading = ref(true)

  const fetchUserProfile = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      const db = getFirestore()
      const userDoc = await getDoc(doc(db, 'users', user.uid))

      if (userDoc.exists()) {
        const data = userDoc.data()
        userprofile.value = {
          profileImage: data.profileImage || '',
          username: data.username || null,
          contactNo: data.contactNo || null,
          country: data.country || null
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error(t('profile.profileLoadFailed'))
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return false

      const db = getFirestore()
      const userDocRef = doc(db, 'users', user.uid)

      await updateDoc(userDocRef, { ...profileData })
      userprofile.value = { ...profileData }

      toast.success(t('profile.profileUpdatedSuccess'))
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(t('profile.profileUpdateFailed'))
      return false
    }
  }

  const uploadProfileImage = async (file) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error(t('profile.noUserSignedIn'))

      const compressedFile = await compressImage(file, 300, 0.6)
      const storage = getStorage()
      const storageReference = storageRef(storage, `profileImages/${user.uid}`)

      await uploadBytes(storageReference, compressedFile)
      return await getDownloadURL(storageReference)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(t('profile.profileImageUploadFailed'))
      return null
    }
  }

  return {
    userprofile,
    loading,
    fetchUserProfile,
    updateProfile,
    uploadProfileImage
  }
}
