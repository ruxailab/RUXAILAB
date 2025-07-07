<template>
  <div>
    <Snackbar />
    <Intro />
    <About />
    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import Intro from '@/components/atoms/Introduction'
import About from '@/components/organisms/LandingAbout'
import AppFooter from '@/components/organisms/AppFooter'
import Snackbar from '@/components/atoms/Snackbar'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore();
const router = useRouter();

const user = computed(() => store.getters.user);

onMounted(() => {
  if(!user.value) {
    router.push('/signin')
  } else {
    router.push('/testslist')
  }
})
</script>
