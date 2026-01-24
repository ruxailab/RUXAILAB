<template>
  <VCard class="cards">
    <v-card-title class="d-flex justify-between align-center" style="cursor: pointer">
      <div>
        <v-icon style="cursor: pointer;">mdi-drag</v-icon>
      </div>

      <div class="ml-3">
        {{ props.element.title }}
      </div>

      <div v-if="props.options.card_tooltip && props.element.tooltip" class="d-flex ml-auto align-center">
        <v-tooltip :text="element.tooltip">
          <template #activator="{ props }">
            <v-icon v-bind="props">
              mdi-information-slab-circle-outline
            </v-icon>
          </template>
        </v-tooltip>
      </div>
    </v-card-title>

    <VCol v-if="props.options.card_description && props.element.description">
      {{ props.element.description }}
    </VCol>
  </VCard>
</template>

<script setup>
// Props
const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  },
});
</script>
