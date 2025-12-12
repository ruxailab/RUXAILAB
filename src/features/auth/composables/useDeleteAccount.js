import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

export function useDeleteAccount() {
  const { t } = useI18n();
  const toast = useToast();
  const store = useStore();

  const isDeleting = ref(false);
  const deleteStep = ref(1);
  const deleteConfirmText = ref('');
  const userPassword = ref('');

  const deleteAccount = async (user) => {
    await store.dispatch('deleteAuth', user.uid);
    toast.success(t('profile.accountDeletedSuccess'));
    await signOut();
  };

  const signOut = async () => {
    try {
      await store.dispatch('logout');
      window.location.href = '/';
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteConfirmText = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    // Check if user uses Google provider
    const hasGoogleProvider = user.providerData.some(
      (provider) => provider.providerId === 'google.com'
    );

    if (!hasGoogleProvider) {
      deleteStep.value = 2;
      return;
    }

    try {
      isDeleting.value = true;
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
      await deleteAccount(user);
    } catch (error) {
      console.error('Error during account deletion:', error);
      toast.error(t('profile.accountDeletionFailed'));
    } finally {
      isDeleting.value = false;
    }
  };

  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!userPassword.value) {
      toast.error(t('profile.passwordRequired'));
      return;
    }

    try {
      isDeleting.value = true;
      const cred = EmailAuthProvider.credential(user.email, userPassword.value);
      await reauthenticateWithCredential(user, cred);
      await deleteAccount(user);
    } catch (error) {
      console.error('Error during account deletion:', error);
      toast.error(t('profile.accountDeletionFailed'));
    } finally {
      isDeleting.value = false;
    }
  };

  const resetDeleteDialog = () => {
    deleteStep.value = 1;
    deleteConfirmText.value = '';
    userPassword.value = '';
    isDeleting.value = false;
  };

  return {
    isDeleting,
    deleteStep,
    deleteConfirmText,
    userPassword,
    handleDeleteConfirmText,
    handleDeleteAccount,
    resetDeleteDialog,
  };
}
