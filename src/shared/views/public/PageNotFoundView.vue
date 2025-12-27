<template>
  <div class="background">
    <v-row justify="center">
      <v-col
        cols="12"
        md="5"
      >
        <v-img :src="require('@/assets/pageNotFound.svg')" />
        <div
          class="text-center"
          style="font-size:50px; color: grey"
        >
          Page Not Found
        </div>
        <div
          class="text-center"
          style="font-size:15px; color: grey"
        >
          We weren't able to find the page you were looking for.
        </div>
        <v-row
          justify="center"
          class="mt-4"
        >
          <v-btn
            style="color: #f9a826"
            variant="outlined"
            rounded
            @click="sendHome"
          >
            Go Back
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGoBack } from '@/composables/useGoBack'

const router = useRouter()
const route = useRoute()
const { goBackOrRedirect } = useGoBack()
const prevRoute = ref(null)

const sendHome = () => {
  goBackOrRedirect('/')
}

defineOptions({
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from
    })
  }
})
</script>

<style scoped>
.background {
  background-color: #f5f7ff;
  height: 100vh;
}
</style>
