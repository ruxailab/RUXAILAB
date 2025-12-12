import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import {
    getAuth,
    updatePassword,
} from 'firebase/auth';

export function useChangePassword() {
    const { t } = useI18n();
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
        (v) => !!v || t('profile.passwordRequired'),
        (v) => v.length >= 8 || t('profile.passwordMinLength'),
        (v) => /[A-Z]/.test(v) || t('profile.passwordUppercase'),
        (v) => hasSpecialChar(v) || t('profile.passwordSymbol'),
    ]);

    const confirmPasswordRules = computed(() => [
        (v) => !!v || t('profile.confirmPasswordRequired'),
        (v) => v === newPassword.value || t('profile.passwordsMatch'),
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
                toast.success(t('profile.passwordChangedSuccess'));
                newPassword.value = '';
                confirmPassword.value = '';
                return true;
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(t('profile.passwordChangeFailed'));
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
