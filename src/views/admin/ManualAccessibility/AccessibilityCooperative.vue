<template>
  <div>
    <label for="userDropdown">Select User:</label>
    <select
      id="userDropdown"
      v-model="selectedUserEmail"
    >
      <option
        v-for="user in users"
        :key="user.id"
        :value="user.email"
      >
        {{ user.email }}
      </option>
    </select>
    <button @click="sendNotification">
      Send Notification
    </button>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Notification from '@/models/Notification';

export default {
  data() {
    return {
      users: [],
      selectedUserEmail: '',
    };
  },
  methods: {
    ...mapActions(['getAllUsers', 'addNotification']),

    async fetchUsers() {
      await this.getAllUsers();
      this.users = this.$store.state.Users.users;
    },

    async sendNotification() {
      if (!this.selectedUserEmail) {
        alert('Please select a user.');
        return;
      }

      const selectedUser = this.users.find(user => user.email === this.selectedUserEmail);
      if (!selectedUser) {
        alert('User not found.');
        return;
      }

      const testId = this.$route.params.testId;
      const notification = new Notification({
        title: 'Test Notification',
        description: 'You have a new notification.',
        redirectsTo: `preview/${testId}`,
        author: 'Admin',
        read: false,
        testId,
      });
      console.log('Notification created:', notification);
      try {
        await this.addNotification({
          userId: selectedUser.id,
          notification,
        });
        alert('Notification sent successfully!');
      } catch (error) {
        console.error('Error sending notification:', error);
        alert('Failed to send notification.');
      }
    },
  },
  created() {
    this.fetchUsers();
  },
};
</script>
