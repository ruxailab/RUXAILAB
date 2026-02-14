<template>
  <div class="background">
    <v-row justify="center">
      <v-col cols="12" md="5">
        <v-img :src="require('@/assets/pageNotFound.svg')" />
        <div class="text-center" style="font-size: 50px; color: grey">
          {{ $t('pageNotFound.title') }}
        </div>
        <div class="text-center" style="font-size: 15px; color: grey">
          {{ $t('pageNotFound.description') }}
        </div>
        <v-row justify="center" class="mt-4">
          <v-btn
            style="color: #f9a826"
            variant="outlined"
            rounded
            @click="sendHome"
          >
            {{ $t('pageNotFound.goBack') }}
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useGoBack } from '@/composables/useGoBack'

const { goBackOrRedirect } = useGoBack()

const sendHome = () => {
  goBackOrRedirect('/')
}

defineOptions({
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from
    })
  },
})
</script>

<style scoped>
.background {
  background-color: #f5f7ff;
  height: 100vh;
}
</style>
