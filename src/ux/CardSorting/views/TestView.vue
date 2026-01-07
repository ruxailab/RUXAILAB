<template>
  <div>
    <Loading />
    <StartScreenTest v-if="!isTestStarted && test" @start="isTestStarted = true" :test="test" />
    <!-- <CardSortingTest v-if="isTestStarted" :test="test" /> -->
  </div>
</template>

<script setup>
import Loading from '@/shared/components/Loading.vue';
// import CardSortingTest from '../components/CardSortingTest.vue';
import StartScreenTest from '@/shared/components/template/StartScreenTest.vue'
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { showError } from '@/shared/utils/toast'


// Stores
const store = useStore();
const route = useRoute();
const router = useRouter();

// Variables
const isTestStarted = ref(false);

// Computed
const test = computed(() => store.getters.test);
const user = computed(() => store.getters.user);

// Lifecycle Hooks
onBeforeMount(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
  await store.dispatch('getCurrentTestAnswerDoc')

  if (!user.value) {
    showError('Login to your RUXAILAB account first to access the test!');
    return router.push('/signin');
  }
})
</script>
