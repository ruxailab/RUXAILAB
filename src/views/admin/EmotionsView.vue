<template>
    <div>
      <Snackbar />
  
      <IntroEmotions @linkClicked="redirectToAnalysis" />
    </div>
  </template>
  
  <script>
  import IntroEmotions from '@/components/molecules/IntroEmotions'
  import Snackbar from '@/components/atoms/Snackbar'
  
  export default {
    components: {
      IntroEmotions,
      Snackbar,
    },
    methods: {
      redirectToAnalysis() {
        console.log('redirecting to analysis')
        this.$router.push(`/emotionsview/${this.$route.params.id}/analysis`)      
    },
      goToDocumentation() {
        this.$router.push('/emotions/documentation').catch(() => {})
      },
      goToCommunity() {
        window.open('https://discord.gg/MFWNpwTq9q')
      },
    },
  }
  </script>
  
  <style scoped>
  </style>
  