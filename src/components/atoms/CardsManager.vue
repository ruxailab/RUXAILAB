<template>
  <v-container>
    <v-row justify="center" justify-md="space-around">
      <v-col v-for="(item, n) in cards" :key="n" cols="12" :md="12 / perRow">
        <v-card :ripple="false" @click="$emit('click', item.path)" :style="item.cardStyle" class="card-fixed-height">
          <div class="image-container">
            <v-img height="120" max-width="120" :style="item.imageStyle"
              :src="require('../../assets/manager/' + item.image)" class="card-image" />
          </div>
          <v-divider></v-divider>

          <div class="text-content">
            <v-card-title class="text-area card-title">
              {{ item.titleDirect ? item.titleDirect : $t(`titles.${item.title}`) }}
            </v-card-title>

            <v-card-text class="text-area card-description">
              {{ item.descriptionDirect ? item.descriptionDirect : $t(`descriptions.${item.description}`) }}
            </v-card-text>
          </div>
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

.card-fixed-height {
  height: 220px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.card-fixed-height:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.image-container {
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  flex-shrink: 0;
}

.card-image {
  margin: 0 auto;
  max-height: 120px;
  max-width: 120px;
  object-fit: contain;
}

.text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card-title {
  height: 60px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 1.1rem !important;
  line-height: 1.3 !important;
  padding: 12px 16px !important;
}

.card-description {
  flex: 1;
  display: flex;
  align-items: flex-start;
  padding: 12px 16px !important;
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
