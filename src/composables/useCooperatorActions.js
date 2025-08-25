import { ref } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';

/**
 * Composable for cooperator management operations
 */
export function useCooperatorActions() {
    const store = useStore();
    const toast = useToast();

    const loading = ref(false);

    /**
     * Generic function to update test data
     */
    const updateTestData = async (testId, updates, module = 'manualAccessibility') => {
        try {
            loading.value = true;
            await store.dispatch(`${module}/updateTest`, {
                testId,
                updates
            });
            return true;
        } catch (error) {
            console.error('Error updating test:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Generic function to fetch test data
     */
    const fetchTestData = async (testId, module = 'manualAccessibility') => {
        try {
            loading.value = true;
            const test = await store.dispatch(`${module}/fetchTest`, testId);
            return test;
        } catch (error) {
            console.error('Error fetching test:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Handle role change with confirmation
     */
    const handleRoleChange = async (item, newValue, roleOptions, onSuccess) => {
        const currentAccessLevelText = roleOptions.find(r => r.value === item.accessLevel)?.title;
        const newAccessLevelText = newValue.title;

        if (item.accessLevel !== newValue.value) {
            const ok = confirm(
                `Change ${item.email} role from ${currentAccessLevelText} to ${newAccessLevelText}?`
            );

            if (ok) {
                try {
                    await onSuccess(item, newValue);
                    toast.success('Role updated successfully!');
                } catch (error) {
                    toast.error('Failed to update role.');
                    throw error;
                }
            }
        }
    };

    /**
     * Handle cooperator removal with confirmation
     */
    const handleCooperatorRemoval = async (coop, onRemove) => {
        const ok = confirm(`Are you sure you want to remove ${coop.email} from your cooperators?`);
        if (ok) {
            try {
                await onRemove(coop);
                toast.success('Cooperator removed successfully!');
            } catch (error) {
                toast.error('Failed to remove cooperator.');
                throw error;
            }
        }
    };

    /**
     * Handle invitation cancellation
     */
    const handleInvitationCancellation = async (guest, onCancel) => {
        const ok = confirm(`Are you sure you want to cancel ${guest.email}'s invitation?`);
        if (ok) {
            try {
                await onCancel(guest);
                toast.success('Invitation cancelled successfully!');
            } catch (error) {
                toast.error('Failed to cancel invitation.');
                throw error;
            }
        }
    };

    /**
     * Show success message
     */
    const showSuccess = (message) => {
        toast.success(message);
    };

    /**
     * Show error message
     */
    const showError = (message) => {
        toast.error(message);
    };

    /**
     * Show warning message
     */
    const showWarning = (message) => {
        toast.warning(message);
    };

    return {
        loading,
        updateTestData,
        fetchTestData,
        handleRoleChange,
        handleCooperatorRemoval,
        handleInvitationCancellation,
        showSuccess,
        showError,
        showWarning
    };
}
