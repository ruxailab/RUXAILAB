import { ref, computed } from 'vue';
import {
    getAuth,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    reauthenticateWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import i18n from '@/app/plugins/i18n';
import { showError, showSuccess } from '../../../shared/utils/toast';

export function useChangePassword() {
    const currentPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const showCurrentPassword = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const valid = ref(false);

    const isGoogleUser = computed(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return false;
        return user.providerData.some(
            (provider) => provider.providerId === 'google.com'
        );
    });

    const hasSpecialChar = (str) => {
        const specialChars = /[!@#$%^&*(),.{}|<>]/;
        return specialChars.test(str);
    };

    const currentPasswordRules = computed(() => [
        (v) => !!v || i18n.global.t('profile.currentPasswordRequired'),
    ]);

    const passwordRules = computed(() => [
        (v) => !!v || i18n.global.t('profile.passwordRequired'),
        (v) => (v && v.length >= 8) || i18n.global.t('profile.passwordMinLength'),
        (v) => (v && /[A-Z]/.test(v)) || i18n.global.t('profile.passwordUppercase'),
        (v) => (v && hasSpecialChar(v)) || i18n.global.t('profile.passwordSymbol'),
    ]);

    const confirmPasswordRules = computed(() => [
        (v) => !!v || i18n.global.t('profile.confirmPasswordRequired'),
        (v) => v === newPassword.value || i18n.global.t('profile.passwordsMatch'),
    ]);

    const specialCharColor = computed(() =>
        hasSpecialChar(newPassword.value) ? 'success' : 'grey-darken-1'
    );

    const specialCharIcon = computed(() =>
        hasSpecialChar(newPassword.value) ? 'mdi-check-circle' : 'mdi-circle-outline'
    );

    const resetForm = () => {
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        showCurrentPassword.value = false;
        showPassword.value = false;
        showConfirmPassword.value = false;
        valid.value = false;
    };

    const changePassword = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error('No user logged in');
            }

            // For Google users, re-authenticate with Google popup
            if (isGoogleUser.value) {
                await reauthenticateWithPopup(user, new GoogleAuthProvider());
            } else {
                // For email/password users, re-authenticate with current password
                const credential = EmailAuthProvider.credential(user.email, currentPassword.value);
                await reauthenticateWithCredential(user, credential);
            }

            // Update password
            await updatePassword(user, newPassword.value);
            showSuccess('profile.passwordChangedSuccess');
            resetForm();
            return true;
        } catch (error) {
            console.error('Error changing password:', error);

            // Handle specific Firebase auth errors
            if (error.code === 'auth/wrong-password') {
                showError('profile.wrongCurrentPassword');
            } else if (error.code === 'auth/requires-recent-login') {
                showError('profile.recentLoginRequired');
            } else if (error.code === 'auth/weak-password') {
                showError('profile.weakPassword');
            } else {
                showError('profile.passwordChangeFailed');
            }
            return false;
        }
    };

    const toggleCurrentPasswordVisibility = () => {
        showCurrentPassword.value = !showCurrentPassword.value;
    };

    const togglePasswordVisibility = () => {
        showPassword.value = !showPassword.value;
    };

    const toggleConfirmPasswordVisibility = () => {
        showConfirmPassword.value = !showConfirmPassword.value;
    };

    return {
        currentPassword,
        newPassword,
        confirmPassword,
        showCurrentPassword,
        showPassword,
        showConfirmPassword,
        valid,
        isGoogleUser,
        currentPasswordRules,
        passwordRules,
        confirmPasswordRules,
        specialCharColor,
        specialCharIcon,
        changePassword,
        resetForm,
        toggleCurrentPasswordVisibility,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
    };
}
