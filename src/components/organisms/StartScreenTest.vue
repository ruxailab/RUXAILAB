<template>
  <div>
    <VRow class="background pa-0 ma-0">
      <VCol cols="6" class="ml-5">
        <h1 class="titleView pb-1">
          {{ test.testTitle }}
        </h1>
        <p class="description">
          {{ test.testDescription }}
        </p>
        <VRow justify="center">
          <VBtn color="white" variant="outlined" rounded @click="$emit('start')">
            Start Test
          </VBtn>
        </VRow>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
// Props
defineProps({
  test: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['start']);
</script>

<style scoped>
.background {
  align-items: center;
  background: linear-gradient(134.16deg, #ffab25 -13.6%, #dd8800 117.67%);
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.description {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
  justify-content: center;
}
</style>
