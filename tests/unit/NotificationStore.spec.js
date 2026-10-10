jest.mock('@/features/notifications/controllers/NotificationController', () => {
  const subscribeToNotifications = jest.fn()
  const Controller = jest.fn().mockImplementation(() => ({
    subscribeToNotifications,
    addNotification: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markNotificationAsUnread: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
  }))
  Controller.subscribeToNotifications = subscribeToNotifications
  return Controller
})

import NotificationModule from '@/features/notifications/store/notification'
import NotificationController from '@/features/notifications/controllers/NotificationController'

describe('Notification Store Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    NotificationModule.actions.unsubscribeFromNotifications({ commit: jest.fn() })
  })

  it('subscribes to notifications and stores the unsubscribe callback', async () => {
    const mockUnsubscribe = jest.fn()
    NotificationController.subscribeToNotifications.mockResolvedValue(mockUnsubscribe)

    const commit = jest.fn()
    const result = await NotificationModule.actions.subscribeToNotifications(
      { commit },
      'user-1',
    )

    expect(NotificationController.subscribeToNotifications).toHaveBeenCalledWith(
      'user-1',
      expect.any(Function),
    )
    expect(result).toBe(mockUnsubscribe)
  })

  it('unsubscribes previous listener before starting a new subscription', async () => {
    const firstUnsubscribe = jest.fn()
    const secondUnsubscribe = jest.fn()

    NotificationController.subscribeToNotifications
      .mockResolvedValueOnce(firstUnsubscribe)
      .mockResolvedValueOnce(secondUnsubscribe)

    const commit = jest.fn()

    await NotificationModule.actions.subscribeToNotifications(
      { commit },
      'user-1',
    )
    expect(firstUnsubscribe).not.toHaveBeenCalled()

    await NotificationModule.actions.subscribeToNotifications(
      { commit },
      'user-2',
    )
    expect(firstUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes and clears notifications on unsubscribeFromNotifications', async () => {
    const mockUnsubscribe = jest.fn()
    NotificationController.subscribeToNotifications.mockResolvedValue(mockUnsubscribe)

    const commit = jest.fn()

    await NotificationModule.actions.subscribeToNotifications(
      { commit },
      'user-1',
    )

    NotificationModule.actions.unsubscribeFromNotifications({ commit })

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledWith('setNotifications', [])
  })

  it('safely handles unsubscribeFromNotifications when no active subscription exists', () => {
    const commit = jest.fn()

    expect(() => {
      NotificationModule.actions.unsubscribeFromNotifications({ commit })
    }).not.toThrow()

    expect(commit).toHaveBeenCalledWith('setNotifications', [])
  })
})
