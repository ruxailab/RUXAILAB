<template>
  <div>
    {{ categories }}
    <ShowInfo :title="props.test.testTitle">
      <template #content>
        <v-divider class="mb-5" />

        <v-container>
          <VRow class="fill-height" align="center" justify="center">
            <VCol :cols="12 / (countCategories + 1)" class="mb-0 pb-0">
              <VCard>
                <VCardTitle>
                  <p>0 of {{ cards.length }} cards</p>
                </VCardTitle>

                <Draggable v-model="cards" item-key="title" class="list-group">
                  <template #item="{ element }">
                    <VCard class="cards">
                      <v-card-title class="d-flex justify-between align-center" style="cursor: pointer">
                        <div>
                          <v-icon style="cursor: pointer;">mdi-drag</v-icon>
                        </div>

                        <div class="ml-3">
                          {{ element.title }}
                        </div>
                      </v-card-title>
                    </VCard>
                  </template>
                </Draggable>
              </VCard>
            </VCol>

            <VCol :cols="12 / (countCategories + 1)" class="mb-0 pb-0" style="background-color: aqua;"
              v-for="(category, index) in categories" :key="index">
              <VCard>
              </VCard>

              <VRow justify="center">
                <h1 style="color: #455a64;" class="mt-2">
                  {{ props.test.testTitle }}
                </h1>
              </VRow>
            </VCol>
          </VRow>
        </v-container>
      </template>
    </ShowInfo>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ShowInfo from '../organisms/ShowInfo.vue';
import Draggable from 'vuedraggable'

// Props
const props = defineProps({
  test: {
    type: Object,
    required: false
  }
});

// Computed
const countCategories = computed(() => {
  return categories.value.length;
});

const categories = computed(() => {
  return props.test.testStructure.cardSorting.categories;
});

const cards = computed(() => {
  return props.test.testStructure.cardSorting.cards;
});
</script>

<style scoped>
.cards {
  border-radius: 20px;
  padding: 10px;
  margin: 10px;
}
</style>
