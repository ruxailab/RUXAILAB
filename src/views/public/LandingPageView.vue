<template>
  <div>
    <Snackbar />
    <Intro />
    <About />
    <AppFooter />
  </div>
</template>

<script setup>
import Intro from '@/components/atoms/Introduction'
import About from '@/components/organisms/LandingAbout'
import AppFooter from '@/components/organisms/AppFooter'
import Snackbar from '@/components/atoms/Snackbar'
</script>
