<template>
  <ShowInfo :title="finalMessage">
    <template #content>
      <div class="test-content pa-6 rounded-xl text-center">
        <v-icon size="96" color="success"> mdi-check-circle-outline </v-icon>
        <h3 class="text-h5 font-weight-bold mt-4 text-secondary">
          {{ finalMessage }}!
        </h3>

        <div
          class="text-body-1 mt-2 text-grey-darken-1"
          v-html="sanitizedCongratulations"
        ></div>

        <p class="text-body-1 mt-6 text-grey-darken-1">
          {{ submitMessage }}
        </p>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          class="mt-4"
          @click="$emit('submit')"
        >
          <v-icon start> mdi-send </v-icon>
          {{ submitBtn }}
        </v-btn>
      </div>
    </template>
  </ShowInfo>
</template>
<script setup>
import { computed } from 'vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { sanitizeHtml } from '@/shared/utils/sanitizeUtils'
const props = defineProps({
  finalMessage: String,
  congratulations: String,
  submitMessage: String,
  submitBtn: String,
})
defineEmits(['submit'])
const sanitizedCongratulations = computed(() =>
  sanitizeHtml(props.congratulations),
)
</script>
