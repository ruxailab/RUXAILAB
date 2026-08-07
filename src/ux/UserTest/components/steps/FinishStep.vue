<template>
  <ShowInfo>
    <template #content>
      <div ref="finishContent" class="test-content pa-6 rounded-xl text-center">
        <h2 class="split finish-title text-h3 mb-4 text-primary">
          {{ finalMessage }}
        </h2>
        <div
          class="split finish-body text-h6 mb-6 text-grey-darken-3"
          v-html="congratulations"
        ></div>
        <p class="split finish-body text-h6 mb-6 text-grey-darken-3">
          {{ submitMessage }}
        </p>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          @click="$emit('submit')"
        >
          <v-icon start>mdi-send</v-icon>
          {{ submitBtn }}
        </v-btn>
      </div>
    </template>
  </ShowInfo>
</template>
<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { animateWelcomeText } from '@/shared/utils/animations'

defineProps({
  finalMessage: String,
  congratulations: String,
  submitMessage: String,
  submitBtn: String,
})
defineEmits(['submit'])

const finishContent = ref(null)
let cleanupSplitAnimation = () => {}

async function runSplitAnimation() {
  if (typeof cleanupSplitAnimation === 'function') {
    cleanupSplitAnimation()
  }

  await nextTick()
  cleanupSplitAnimation = await animateWelcomeText(
    finishContent.value?.querySelectorAll('.split'),
    finishContent.value,
  )
}

onMounted(async () => {
  await runSplitAnimation()
})

onBeforeUnmount(() => {
  if (typeof cleanupSplitAnimation === 'function') {
    cleanupSplitAnimation()
    cleanupSplitAnimation = () => {}
  }
})
</script>

<style scoped>
.split {
  opacity: 0;
}

.finish-title {
  font-weight: 300;
}

.finish-body {
  font-weight: 300;
}
</style>
