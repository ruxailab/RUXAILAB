<template>
  <v-dialog v-model="dialogLeaveStatus" width="600" persistent>
    <v-card>
      <v-card-title class="text-h5 bg-red text-white" primary-title>
        {{ $t('alerts.leave') }}
      </v-card-title>
      <v-card-text>
        {{ $t('alerts.sureLeave') }}
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          class="bg-grey-lighten-3"
          variant="text"
          @click="resetLeaveState"
        >
          {{ $t('buttons.stay') }}
        </v-btn>
        <v-btn
          class="bg-red text-white ml-1"
          variant="text"
          @click="handleLeave"
        >
          {{ $t('buttons.leave') }}
        </v-btn>
        <v-btn class="bg-green text-white ml-1" variant="text" @click="submit">
          {{ $t('buttons.saveandleave') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import {
  clearPendingLeaveRoute,
  navigateToPendingLeaveRoute,
} from '@/shared/utils/pendingLeaveRoute'

const emit = defineEmits(['submit'])

const store = useStore()
const router = useRouter()

const dialogLeaveStatus = computed(() => store.getters.getDialogLeaveStatus)

const resetLeaveState = () => clearPendingLeaveRoute(store)

const discardChanges = () => {
  store.commit('SET_LOCAL_CHANGES', false)
}

const handleLeave = async () => {
  discardChanges()
  await navigateToPendingLeaveRoute(store, router)
}

const submit = () => {
  emit('submit')
}
</script>
