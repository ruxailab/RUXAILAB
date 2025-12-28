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

      await updateDoc(userDocRef, {
        username: profileData.username,
        contactNo: profileData.contactNo,
        country: profileData.country,
        profileImage: profileData.profileImage
      })

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
      const storageReference = storageRef(
        storage,
        `profileImages/${user.uid}`
      )

      await uploadBytes(storageReference, compressedFile)
      return await getDownloadURL(storageReference)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(t('profile.profileImageUploadFailed'))
      return null
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
              if (!blob) {
                reject(new Error('Image compression failed'))
                return
              }

              resolve(
                new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
              )
            },
            'image/jpeg',
            quality
          )
        }

        img.onerror = () => reject(new Error('Image load failed'))
      }

      reader.onerror = () => reject(new Error('FileReader failed'))
    })
  }

  return {
    userprofile,
    loading,
    fetchUserProfile,
    updateProfile,
    uploadProfileImage
  }
}
