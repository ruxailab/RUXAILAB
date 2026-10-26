import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { db } from '@/app/plugins/firebase'
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  writeBatch,
  doc,
} from 'firebase/firestore'

const PARENT_COLLECTION = 'users'
const NOTIFICATIONS_SUBCOLLECTION = 'notifications'

export default class NotificationController extends Controller {
  constructor() {
    super()
  }

  _getCollection(userId) {
    return `${PARENT_COLLECTION}/${userId}/${NOTIFICATIONS_SUBCOLLECTION}`
  }

  async addNotification(payload) {
    const notification = payload.notification.toFirestore()

    const docRef = await super.create(
      this._getCollection(payload.userId),
      notification,
    )

    return {
      ...notification,
      id: docRef.id,
    }
  }

  async subscribeToNotifications(userId, callback) {
    const notificationsCollection = collection(db, this._getCollection(userId))

    const q = query(notificationsCollection, orderBy('createdDate', 'desc'))

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((document) => ({
        ...document.data(),
        id: document.id,
      }))

      callback(notifications)
    })
  }

  async markNotificationAsRead(payload) {
    return super.update(
      this._getCollection(payload.userId),
      payload.notificationId,
      {
        read: true,
        readAt: Date.now(),
      },
    )
  }

  async markNotificationAsUnread(payload) {
    return super.update(
      this._getCollection(payload.userId),
      payload.notificationId,
      {
        read: false,
        readAt: Date.now(),
      },
    )
  }

  async markAllNotificationsAsRead(payload) {
    const unreadNotifications = payload.notifications.filter(
      (notification) => !notification.read,
    )

    if (unreadNotifications.length === 0) {
      return
    }

    const batch = writeBatch(db)
    const readAt = Date.now()

    unreadNotifications.forEach((notification) => {
      const notificationRef = doc(
        db,
        this._getCollection(payload.userId),
        notification.id,
      )

      batch.update(notificationRef, {
        read: true,
        readAt,
      })
    })

    return batch.commit()
  }
}
