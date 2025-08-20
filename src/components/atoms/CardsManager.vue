<template>
  <v-container>
    <v-row justify="center" justify-md="space-around">
      <v-col v-for="(item, n) in cards" :key="n" cols="12" :md="12 / perRow">
        <v-card :ripple="false" @click="$emit('click', item.path)" :style="item.cardStyle">
          <div class="d-flex justify-center align-center pa-4">
            <v-img height="120" max-width="120" :style="item.imageStyle"
              :src="require('../../assets/manager/' + item.image)" class="mx-auto" />
          </div>
          <v-divider></v-divider>

          <v-card-title class="text-area">
            {{ item.titleDirect ? item.titleDirect : $t(`titles.${item.title}`) }}
          </v-card-title>

          <v-card-text class="text-area">
            {{ item.descriptionDirect ? item.descriptionDirect : $t(`descriptions.${item.description}`) }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    cards: {
      type: Array,
      default: () => ([]),
      require: true,
    },

    perRow: {
      type: Number,
      default: 0,
      require: true,
    },
  },

  emits: ['click'],
}
</script>

<style scoped>
.text-area {
  background-color: rgba(0, 0, 0, 0.8) !important;
  color: white !important;
  margin: 0 !important;
}

.v-card-title.text-area {
  padding-bottom: 8px !important;
}

.v-card-text.text-area {
  padding-top: 8px !important;
}
</style>
