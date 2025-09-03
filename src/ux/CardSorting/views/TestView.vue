<template>
  <div>
    <Loadding />
    <Snackbar />
    <StartScreenTest v-if="!isTestStarted && test" @start="isTestStarted = true" :test="test" />
    <CardSortingTest v-if="isTestStarted" :test="test" />
  </div>
</template>

<script setup>
import Loadding from '@/shared/components/Loadding.vue';
import Snackbar from '@/shared/components/Snackbar.vue';
import CardSortingTest from '../components/CardSortingTest.vue';
import StartScreenTest from '@/shared/components/template/StartScreenTest.vue'
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: false
  }
});

// Stores
const store = useStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();

// Variables
const isAdmin = ref(false);
const isTestStarted = ref(false);

// Computed
const test = computed(() => store.getters.test);
const user = computed(() => store.getters.user);

// Methods
const verifyAdmin = () => {
  return test.value.testAdmin.email === user.value.email ? true : false;
};

// Lifecycle Hooks
onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')

  if (!user.value) {
    toast.error('Login to your RUXAILAB account first to access the test!');
    return router.push('/signin');
  }

  if (!route.params.token) {
    toast.info('Use a session link to access the test');
    return router.push('/cardSorting/managerview/' + test.value.id);
  }

  if (user.value.id !== route.params.token) {
    toast.error('Invalid session link. Please use the correct link to access the test.');
    return router.push('/admin');
  }

  // isAdmin.value = verifyAdmin();
})
</script>
