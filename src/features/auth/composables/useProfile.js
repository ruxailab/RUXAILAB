import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
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

export function useProfile() {
    const { t } = useI18n();
    const toast = useToast();

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
            toast.error(t('profile.profileLoadFailed'));
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
                });

                userprofile.value = {
                    ...userprofile.value,
                    username: profileData.username,
                    contactNo: profileData.contactNo,
                    country: profileData.country,
                };

                toast.success(t('profile.profileUpdatedSuccess'));
                return true;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(t('profile.profileUpdateFailed'));
            return false;
        }
    };

    const uploadProfileImage = async (file) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error(t('profile.noUserSignedIn'));

            const storage = getStorage();
            const storageReference = storageRef(storage, `profileImages/${user.uid}`);

            const snapshot = await uploadBytes(storageReference, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { profileImage: downloadURL });

            userprofile.value.profileImage = downloadURL;
            toast.success(t('profile.profileImageUpdatedSuccess'));
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error(t('profile.profileImageUploadFailed'));
            return null;
        }
    };

    return {
        userprofile,
        loading,
        fetchUserProfile,
        updateProfile,
        uploadProfileImage,
    };
}
