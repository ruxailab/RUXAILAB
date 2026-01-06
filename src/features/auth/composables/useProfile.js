import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    getAuth,
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { showError, showSuccess } from '../../../shared/utils/toast';

export function useProfile() {
    const { t } = useI18n();

    const userprofile = ref({
        profileImage: null,
        username: null,
        contactNo: null,
        country: null,
    });

    const loading = ref(true);

    const fetchUserProfile = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const db = getFirestore();
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    userprofile.value = {
                        profileImage: data.profileImage || '',
                        username: data.username || null,
                        contactNo: data.contactNo || null,
                        country: data.country || null,
                    };
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            showError(t('profile.profileLoadFailed'));
        } finally {
            loading.value = false;
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const db = getFirestore();
                const userDocRef = doc(db, 'users', user.uid);

                await updateDoc(userDocRef, {
                    username: profileData.username,
                    contactNo: profileData.contactNo,
                    country: profileData.country,
                    profileImage: profileData.profileImage,
                });

                userprofile.value = {
                    ...userprofile.value,
                    username: profileData.username,
                    contactNo: profileData.contactNo,
                    country: profileData.country,
                    profileImage: profileData.profileImage,
                };

                showSuccess('profile.profileUpdatedSuccess');
                return true;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showError('profile.profileUpdateFailed');
            return false;
        }
    };

    const uploadProfileImage = async (file, onPreviewReady = null) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error(t('profile.noUserSignedIn'));

            // Create immediate preview URL
            const previewUrl = URL.createObjectURL(file);

            // Call preview callback immediately if provided
            if (onPreviewReady) {
                onPreviewReady(previewUrl);
            }

            // Update UI immediately with preview
            userprofile.value.profileImage = previewUrl;

            // Compress image for upload (smaller size for faster upload)
            // Use more aggressive compression for faster upload
            const compressedFile = await compressImage(file, 300, 0.6);

            const storage = getStorage();
            const storageReference = storageRef(storage, `profileImages/${user.uid}`);

            // Upload in background
            const snapshot = await uploadBytes(storageReference, compressedFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Update database
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { profileImage: downloadURL });

            // Clean up preview URL and update with final URL
            URL.revokeObjectURL(previewUrl);
            userprofile.value.profileImage = downloadURL;

            showSuccess('profile.profileImageUpdatedSuccess');
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            showError('profile.profileImageUploadFailed');
            return null;
        }
    };

    const compressImage = (file, maxWidth, quality) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if image is larger than maxWidth
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    // Use better image rendering for quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                }));
                            } else {
                                reject(new Error('Canvas to Blob conversion failed'));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };

                img.onerror = () => reject(new Error('Image load failed'));
            };

            reader.onerror = () => reject(new Error('FileReader error'));
        });
    };

    return {
        userprofile,
        loading,
        fetchUserProfile,
        updateProfile,
        uploadProfileImage,
    };
}
