<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center pb-2">
      <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
      Quick Actions
    </v-card-title>
    
    <v-card-text class="pa-4">
      <div class="d-flex flex-column gap-3">
        <v-btn
          color="primary"
          variant="outlined"
          block
          @click="viewTest"
        >
          <v-icon start>mdi-eye</v-icon>
          Preview Test
        </v-btn>
        
        <v-btn
          color="success"
          variant="outlined"
          block
          @click="shareTest"
        >
          <v-icon start>mdi-share-variant</v-icon>
          Share Test
        </v-btn>
        
        <v-btn
          color="info"
          variant="outlined"
          block
          @click="exportData"
        >
          <v-icon start>mdi-download</v-icon>
          Export Data
        </v-btn>
        
        <v-btn
          color="warning"
          variant="outlined"
          block
          @click="editTest"
        >
          <v-icon start>mdi-pencil</v-icon>
          Edit Test
        </v-btn>
        
        <v-btn
          v-if="test.status === 'active'"
          color="orange"
          variant="outlined"
          block
          @click="pauseTest"
        >
          <v-icon start>mdi-pause</v-icon>
          Pause Test
        </v-btn>
        
        <v-btn
          v-else-if="test.status === 'paused'"
          color="success"
          variant="outlined"
          block
          @click="resumeTest"
        >
          <v-icon start>mdi-play</v-icon>
          Resume Test
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const props = defineProps({
  test: {
    type: Object,
    default: () => ({})
  }
})

const router = useRouter()
const store = useStore()

const viewTest = () => {
  router.push(`/userTest/unmoderated/test/${props.test.id}`)
}

const shareTest = () => {
  // Copy test URL to clipboard
  const testUrl = `${window.location.origin}/userTest/unmoderated/test/${props.test.id}`
  navigator.clipboard.writeText(testUrl).then(() => {
    store.commit('SET_TOAST', { 
      type: 'success', 
      message: 'Test URL copied to clipboard!' 
    })
  }).catch(() => {
    store.commit('SET_TOAST', { 
      type: 'error', 
      message: 'Failed to copy URL' 
    })
  })
}

const exportData = () => {
  router.push(`/userTest/unmoderated/answers/${props.test.id}`)
}

const editTest = () => {
  router.push(`/userTest/unmoderated/edit/${props.test.id}`)
}

const pauseTest = async () => {
  try {
    await store.dispatch('updateTestStatus', {
      testId: props.test.id,
      status: 'paused'
    })
    store.commit('SET_TOAST', { 
      type: 'success', 
      message: 'Test paused successfully' 
    })
  } catch (error) {
    store.commit('SET_TOAST', { 
      type: 'error', 
      message: 'Failed to pause test' 
    })
  }
}

const resumeTest = async () => {
  try {
    await store.dispatch('updateTestStatus', {
      testId: props.test.id,
      status: 'active'
    })
    store.commit('SET_TOAST', { 
      type: 'success', 
      message: 'Test resumed successfully' 
    })
  } catch (error) {
    store.commit('SET_TOAST', { 
      type: 'error', 
      message: 'Failed to resume test' 
    })
  }
}
</script>