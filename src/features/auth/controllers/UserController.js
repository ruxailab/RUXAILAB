import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import User from '@/features/auth/models/UserModel'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { documentId } from 'firebase/firestore';
const COLLECTION = 'users'

export default class UserController extends Controller {
  constructor() {
    super()
  }
  async create(payload) {
    const user = new User({
      email: payload.email,
      username: payload.displayName || payload.username || '',
      profileImage: payload.profileImage || '',
      country: payload.country || '',
      accessLevel: 1,
      myTests: {},
      myAnswers: {},
      notifications: [],
      storageUsageMB: 0,
    }).toFirestore();
    return super.set(COLLECTION, payload.id, user);
  }

  async update(docId, payload) {
    return super.update(COLLECTION, docId, payload);
  }

  async readAll() {
    const docs = await super.readAll(COLLECTION);
    return docs.map((doc) => new User(doc));
  }

  async getById(docId) {
    const res = await super.readOne(COLLECTION, docId);
    return new User(Object.assign({ id: res.id }, res.data()));
  }

  async getUserWithStudies(docId) {
    const res = await super.readOne(COLLECTION, docId);
    const user = new User({ id: res.id, ...res.data() });

    const myTestsIds = Object.keys(user.myTests || {});
    const myAnswersIds = Object.keys(user.myAnswers || {});

    const [testsDocs, answersDocs] = await Promise.all([
      this._fetchStudiesByIds(myTestsIds),
      this._fetchStudiesByIds(myAnswersIds),
    ]);

    const myTests = {};
    testsDocs.forEach((doc) => {
      myTests[doc.id] = {
        ...(user.myTests?.[doc.id] || {}),
        ...doc,
      };
    });

    const myAnswers = {};
    answersDocs.forEach((doc) => {
      myAnswers[doc.id] = {
        ...(user.myAnswers?.[doc.id] || {}),
        ...doc,
      };
    });

    user.myTests = myTests;
    user.myAnswers = myAnswers;

    return user;
  }

  async _fetchStudiesByIds(ids) {
    if (!ids || ids.length === 0) return [];

    try {
      // If there are few (<= 10), use "in" query (faster and more direct)
      if (ids.length <= 10) {
        const q = {
          field: documentId(),
          condition: 'in',
          value: ids,
        };
        const res = await super.query('tests', q);
        return res.docs.map((doc) => {
          return Object.assign({ id: doc.id }, doc.data());
        });
      }

      // If there are many (>10), parallelize individual gets
      const promises = ids.map((id) => super.readOne('tests', id));
      const results = await Promise.all(promises);
      return results
        .filter((r) => r.exists())
        .map((r) => {
          return Object.assign({ id: r.id }, r.data());
        });
    } catch (error) {
      console.error('Error fetching studies by IDs:', error);
      throw error;
    }
  }

  async updateProfile(docId, payload) {
    const userData = {
      username: payload.username,
      contactNo: payload.contactNo,
      country: payload.country,
    };
    return super.update(COLLECTION, docId, userData);
  }

  async deleteUser(docId) {
    return super.delete(COLLECTION, docId);
  }

  async changePassword(user, currentPassword, newPassword) {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      console.log('Password updated successfully!');
    } catch (error) {
      throw new Error('Failed to change password: ' + error.message);
    }
  }

  async reauthenticateUser(user, email, password) {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  }

  async addNotification(payload) {
    const userToUpdate = await this.getById(payload.userId)
    userToUpdate.notifications.push(payload.notification.toFirestore())
    return this.update(payload.userId, userToUpdate.toFirestore())
  }

  async markNotificationAsRead(payload) {
    const userToUpdate = new User(payload.user);

    // Find the notification in the notifications array
    const notificationIndex = userToUpdate.notifications.findIndex(
      (n) => n.createdDate === payload.notification.createdDate,
    );

    if (notificationIndex !== -1) {
      // Mark notification as read
      userToUpdate.notifications[notificationIndex].read = true;
      userToUpdate.notifications[notificationIndex].readAt = Date.now();

      // Save updated user data to Firestore
      const updatedUser = await this.update(
        userToUpdate.id,
        userToUpdate.toFirestore(),
      );
      return updatedUser;
    } else {
      // Notification was not found in the array
      throw new Error('Notification not found.');
    }
  }

  async removeNotificationsForTest(testId, cooperators) {
    try {
      for (let cooperator = 0; cooperator < cooperators.length; cooperator++) {
        const userDocID = cooperators[cooperator].userDocId

        // Lê o documento do usuário diretamente
        const userDoc = await super.readOne('users', userDocID)

        // Verifica se o documento do usuário existe
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const userId = userDoc.id

          // Verificar se o usuário tem notificações
          if (userData.notifications && userData.notifications.length > 0) {
            // Filtrar notificações que têm o testId correspondente
            userData.notifications = userData.notifications.filter(
              (notification) => notification.testId !== testId,
            )
            // Atualizar o documento do usuário com as notificações filtradas
            await super.update('users', userId, {
              notifications: userData.notifications,
            })
          }
        } else {
          console.log(`User document with ID ${userDocID} not found.`)
        }
      }

      console.log(`Notifications for test ${testId} removed from all users.`)
    } catch (error) {
      console.error('Error removing notifications for the test:', error)
      throw error
    }
  }

  async removeTestFromUser(userId, testIdToRemove) {
    try {
      const userDoc = await super.readOne('users', userId)

      if (!userDoc.exists()) {
        console.log('User not found.')
        return
      }
      const userData = userDoc.data()
      console.log(userData)

      if (userData.myTests[testIdToRemove]) {
        delete userData.myTests[testIdToRemove]
      }
      if (userData.myAnswers[testIdToRemove]) {
        delete userData.myAnswers[testIdToRemove]
      }

      await super.update('users', userId, userData)

      console.log(`Test ${testIdToRemove} removed from user ${userId}'s data.`)
    } catch (error) {
      console.error('Error removing test from user:', error)
      throw error
    }
  }
  async updateLevel(uid, accessLevel) {
    try {
      return super.update(COLLECTION, uid, { accessLevel });
    } catch (error) {
      console.error('Error updating user access level:', error);
      throw error;
    }
  }
}
