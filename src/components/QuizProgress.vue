<template>
    <div class="progress-container mb-3">
        <v-progress-linear :model-value="progress" color="success" height="12" class="mt-0" />
        <div class="progress-percentage">{{ Math.round(progress) }}%</div>
    </div>
</template>
<script setup>
const props = defineProps({
    progress: Number
})
</script>
