import { useStore } from 'vuex';
import Notification from '@/models/Notification';

/**
 * Composable for notification management
 */
export function useNotificationManager() {
    const store = useStore();

    /**
     * Create and send a notification
     * @param {Object} options - Notification options
     * @param {string} options.userId - Target user ID
     * @param {string} options.title - Notification title
     * @param {string} options.description - Notification description
     * @param {string} options.redirectsTo - Redirect URL
     * @param {string} options.author - Author name
     * @param {string} options.testId - Test ID
     * @param {number} options.accessLevel - Access level
     */
    const sendNotification = async (options) => {
        const {
            userId,
            title,
            description,
            redirectsTo = '/',
            author = 'Admin',
            testId,
            accessLevel
        } = options;

        if (!userId) {
            console.warn('Cannot send notification: userId is required');
            return;
        }

        const notification = new Notification({
            title,
            description,
            redirectsTo,
            author,
            read: false,
            testId,
            accessLevel
        });

        try {
            await store.dispatch('addNotification', {
                userId,
                notification,
            });
            return true;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    };

    /**
     * Send invitation notification
     */
    const sendInvitationNotification = async (userId, testId, message = 'You have been invited to participate in an accessibility test.') => {
        return sendNotification({
            userId,
            title: 'Manual Accessibility Test Invitation',
            description: message,
            redirectsTo: `preview/${testId}`,
            testId
        });
    };

    /**
     * Send reminder notification
     */
    const sendReminderNotification = async (userId, testId) => {
        return sendNotification({
            userId,
            title: 'Manual Accessibility Test Reminder',
            description: 'This is a reminder about your accessibility test invitation.',
            redirectsTo: `preview/${testId}`,
            testId
        });
    };

    /**
     * Send custom message notification
     */
    const sendMessageNotification = async (userId, title, content, testId) => {
        return sendNotification({
            userId,
            title,
            description: content,
            testId
        });
    };

    return {
        sendNotification,
        sendInvitationNotification,
        sendReminderNotification,
        sendMessageNotification
    };
}
