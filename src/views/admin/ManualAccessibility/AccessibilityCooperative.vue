<template>
  <v-container class="pa-0">
    <v-card class="mx-auto my-8 pa-6" max-width="600" elevation="2" style="background: #f5f7ff;">
      <v-row align="center" justify="center">
        <v-col cols="12">
          <v-combobox v-model="selectedUserEmail" :items="users" item-title="email" item-value="email"
            label="Select User" variant="outlined" rounded density="compact" color="#fca326" :hide-no-data="false"
            style="background: #f5f7ff;">
            <template #no-data>
              There are no users registered with that email, press enter to select anyways.
            </template>
          </v-combobox>
        </v-col>
      </v-row>
      <v-row align="center" justify="center">
        <v-col cols="12" class="text-center">
          <v-btn color="orange" class="rounded-lg mt-4" @click="sendNotification" :disabled="!selectedUserEmail">
            <v-icon left>mdi-email</v-icon>
            Send Notification
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card class="mt-6" elevation="1">
            <v-card-title>Invited Users</v-card-title>
            <v-data-table :headers="invitedHeaders" :items="invitedUsers" class="elevation-0" hide-default-footer>
              <template #item.invited="{ item }">
                <v-icon color="green" v-if="item.invited">mdi-check</v-icon>
                <v-icon color="grey" v-else>mdi-close</v-icon>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import Notification from '@/models/Notification';
import { useToast } from 'vue-toastification';

const toast = useToast();
const store = useStore();
const route = useRoute();
const users = ref([]);
const selectedUserEmail = ref('');
const invitedUsers = ref([]);
const invitedHeaders = [
  { title: 'Email', value: 'email' },
  { title: 'Invited', value: 'invited', align: 'center' }
];

const fetchUsers = async () => {
  await store.dispatch('getAllUsers');
  users.value = store.state.Users.users;
};

const fetchTestAndPopulateTable = async () => {
  const testId = route.params.testId;
  try {
    const test = await store.dispatch('manualAccessibility/fetchTest', testId);
    if (test && test.collaborators) {
      invitedUsers.value = Object.entries(test.collaborators).map(([userId, role]) => {
        const userObj = users.value.find(u => u.id === userId);
        return {
          email: userObj ? userObj.email : userId,
          invited: role === 'invited'
        };
      });
    } else {
      invitedUsers.value = [];
    }
  } catch (err) {
    console.error('[AccessibilityCooperative] Failed to fetch test for table:', err);
    invitedUsers.value = [];
  }
};

onMounted(async () => {
  await fetchUsers();
  await fetchTestAndPopulateTable();
});

const sendNotification = async () => {
  if (!selectedUserEmail.value) {
    alert('Please select a user.');
    return;
  }

  // Handle both string and object from combobox
  let email = selectedUserEmail.value;
  if (typeof email === 'object' && email !== null) {
    email = email.email;
  }

  const selectedUser = users.value.find(user => user.email === email);
  if (!selectedUser) {
    alert('User not found.');
    return;
  }

  const testId = route.params.testId;
  // Step 1: Fetch test details from DB
  let currentTest = null;
  try {
    currentTest = await store.dispatch('manualAccessibility/fetchTest', testId);
    console.log('[AccessibilityCooperative] Fetched test:', currentTest);
  } catch (fetchError) {
    console.error('[AccessibilityCooperative] Failed to fetch test:', fetchError);
    toast.error('Failed to fetch test details.');
    return;
  }

  // Step 2: Add collaborator and update DB
  if (!currentTest) {
    toast.error('Test not found.');
    return;
  }
  if (!currentTest.collaborators) currentTest.collaborators = {};
  if (!currentTest.collaborators[selectedUser.id]) {
    currentTest.collaborators[selectedUser.id] = 'invited';
    console.log('[AccessibilityCooperative] Before update collaborators:', { testId: currentTest.id, collaborators: { ...currentTest.collaborators } });
    try {
      await store.dispatch('manualAccessibility/updateTest', { testId: currentTest.id, updates: { collaborators: { ...currentTest.collaborators } } });
      console.log('[AccessibilityCooperative] After update collaborators:', { testId: currentTest.id, collaborators: { ...currentTest.collaborators } });
      // Refresh table after update
      await fetchTestAndPopulateTable();
    } catch (commitError) {
      console.error('[AccessibilityCooperative] updateTest failed:', commitError);
      toast.error('Failed to update collaborators in store.');
      return;
    }
  } else {
    toast.info('User is already a collaborator.');
    return;
  }

  // Step 3: Send notification
  const notification = new Notification({
    title: 'Manual Accessibility Test Notification',
    description: ' You have a new notification.',
    redirectsTo: `preview/${testId}`,
    author: 'Admin',
    read: false,
    testId,
  });
  console.log('Notification created:', notification);
  try {
    await store.dispatch('addNotification', {
      userId: selectedUser.id,
      notification,
    });
    toast.success('Notification sent successfully!');
    selectedUserEmail.value = '';
  } catch (error) {
    console.error('Error sending notification:', error);
    toast.error('Failed to send notification.');
  }
};
</script>
<style scoped>
.v-card {
  border-radius: 20px !important;
}

.v-combobox {
  border-radius: 10px !important;
}

.v-btn {
  font-weight: 600;
  text-transform: unset !important;
}
</style>
