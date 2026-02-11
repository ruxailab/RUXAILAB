<template>
  <v-container>
    <v-row justify="center" justify-md="space-around">
      <v-col v-for="(item, n) in cards" :key="n" cols="12" :md="12 / perRow">
        <v-card
          :ripple="false"
          :style="backgroundImage"
          elevation="3"
          rounded="lg"
          @click="emit('click', item.path)"
        >
          <div class="d-flex justify-center align-center pa-2">
            <v-img
              height="180"
              max-width="180"
              max-height="200"
              :style="item.imageStyle"
              :src="require('../../assets/manager/' + item.image)"
              class="mx-auto"
            />
          </div>
          <v-divider></v-divider>
          <div>
            <v-card-title class="pb-0 text-white">
              {{
                item.titleDirect ? item.titleDirect : $t(`titles.${item.title}`)
              }}
            </v-card-title>

            <v-card-text class="text-white">
              {{
                item.descriptionDirect
                  ? item.descriptionDirect
                  : $t(`descriptions.${item.description}`)
              }}
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  cards: {
    type: Array,
    default: () => [],
    require: true,
  },

  perRow: {
    type: Number,
    default: 0,
    require: true,
  },

  colors: {
    type: Array,
    default: () => ['#FF3F59', '#00213f'],
    required: false,
  },
})

const emit = defineEmits(['click'])

const backgroundImage = computed(() => {
  // Softer gradient: blend colors more gradually
  return `background-image: radial-gradient(circle at top left, #00213f 60%, #FF3F59 160%)`
})
</script>
