export const NOTIFICATION_TYPES = {
  SESSION: 'Session',
  MESSAGE: 'Message',
  COLLABORATION: 'Collaboration',
  PARTICIPANT: 'Participant',
}

export const NOTIFICATION_CONTENT_TYPES = {
  Session: {
    icon: 'mdi-calendar-clock-outline',
    color: 'success',
    label: 'notificationsPage.types.session',
  },
  Message: {
    icon: 'mdi-message-text-outline',
    color: 'info',
    label: 'notificationsPage.types.message',
  },
  Collaboration: {
    icon: 'mdi-account-multiple-plus-outline',
    color: 'purple',
    label: 'notificationsPage.types.collaboration',
  },
  Participant: {
    icon: 'mdi-account-plus-outline',
    color: 'warning',
    label: 'notificationsPage.types.participant',
  },
}

export const DEFAULT_NOTIFICATION_TYPE = {
  icon: 'mdi-bell-outline',
  color: 'grey',
  label: 'notificationsPage.types.notification',
}

export const getNotificationTypeConfig = (type) => {
  return NOTIFICATION_CONTENT_TYPES[type] || DEFAULT_NOTIFICATION_TYPE
}
