import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import {
    getAuth,
    updatePassword,
} from 'firebase/auth';
import i18n from '@/app/plugins/i18n';

export function useChangePassword() {
    const toast = useToast();

    const newPassword = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const valid = ref(false);

    const hasSpecialChar = (str) => {
        const specialChars = /[!@#$%^&*(),.{}|<>]/;
        return specialChars.test(str);
    };

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

    const changePassword = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                await updatePassword(user, newPassword.value);
                toast.success(i18n.global.t('profile.passwordChangedSuccess'));
                newPassword.value = '';
                confirmPassword.value = '';
                return true;
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(i18n.global.t('profile.passwordChangeFailed'));
            return false;
        }
    };

    const resetForm = () => {
        newPassword.value = '';
        confirmPassword.value = '';
        showPassword.value = false;
        showConfirmPassword.value = false;
        valid.value = false;
    };

    return {
        newPassword,
        confirmPassword,
        showPassword,
        showConfirmPassword,
        valid,
        passwordRules,
        confirmPasswordRules,
        specialCharColor,
        specialCharIcon,
        changePassword,
        resetForm,
    };
}
