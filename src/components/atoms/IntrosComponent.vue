<template>
  <v-container style="display: contents; background-color: #f4b700">
    <div
      class="background-gradient"
      :style="backgroundImage"
    >
      <v-row
        class="ml-0"
        align="center"
        justify="center"
        style="height: 100%"
      >
        <div class="text-div">
          <div
            class="mb-4 text-white mobile-center"
            style="font-size: 60px; font-weight: 500"
          >
            {{ $t('titles.drawer.' + title) }}
          </div>
          <v-img
            class="mb-5 hidden-md-and-up"
            cover
            :src="require('../../assets/manager/' + image)"
            max-height="350"
          />
          <div
            style="font-size: 22px"
            class="text-white mb-4 mobile-center"
          >
            {{ main }}
          </div>
          <button
            class="edit-btn rounded-lg text-white"
            @click="emitClick"
          >
            {{ $t('pages.intros.click') }}
          </button>
        </div>

        <v-img
          class="hidden-sm-and-down"
          cover
          max-width="40%"
          max-height="400"
          :src="require('../../assets/manager/' + image)"
        />
      </v-row>
    </div>

    <v-col>
      <v-row
        justify="center"
        class="ml-0"
      >
        <v-col
          cols="12"
          md="8"
        >
          <div class="learn-text">
            {{ $t('pages.intros.learnMore') }}
          </div>
          <v-card
            elevation="4"
            class="ma-0 pa-0"
            style="border-radius: 10px !important"
          >
            <v-list class="ma-0 pa-0">
              <div
                v-for="(item, i) in items"
                :key="i"
              >
                <v-list-item
                  class="py-5"
                  :ripple="false"
                  style="border-radius: 10px !important"
                  @click="emitCallFunc(item.func)"
                >
                  <v-avatar
                    size="50"
                    :color="item.iconColor"
                  >
                    <v-icon
                      size="35"
                    >
                      {{ item.icon }}
                    </v-icon>
                  </v-avatar>

                  <v-list-item-title style="font-size: 25px">
                    {{ item.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.subtitle }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider />
              </div>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
    required: true,
  },
  image: {
    type: String,
    default: '',
    required: true,
  },
  main: {
    type: String,
    default: '',
    required: true,
  },
  link: {
    type: String,
    default: '',
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
    required: true,
  },
  colors: {
    type: Array,
    default: () => [],
    required: true,
  },
})

const emit = defineEmits(['linkClicked', 'callFunc'])

const backgroundImage = computed(() => {
  return `background-image: radial-gradient(circle at top right, ${props.colors[0]}, ${props.colors[1]});`
})

const emitClick = () => {
  emit('linkClicked')
}

const emitCallFunc = (func) => {
  emit('callFunc', func)
}
</script>

<style scoped>
.background-gradient {
  height: 60vh;
}

.learn-text {
  color: rgb(87, 84, 100);
  font-weight: 700;
  font-size: 22px;
  margin-top: 30px;
  margin-bottom: 30px;
}

.text-div {
  max-width: 45%;
}

.page-title {
  font-size: 60px;
  font-weight: 500;
}

/* sm */
@media screen and (max-width: 960px) {
  .text-div {
    max-width: 100%;
    margin: 0px 10px;
    text-justify: center;
  }

  .mobile-center {
    display: flex;
    text-align: center;
    justify-content: center;
    margin: 0px 20px;
  }

  .page-title {
    font-size: 40px;
  }

  .background-gradient {
    height: 100%;
  }
}

.edit-btn {
  width: 30%;
  height: 4vh;
  background-color: rgba(68, 12, 71, 0.644);
  transition: box-shadow 0.5s, background-color 0.5s;
}

.edit-btn:hover {
  box-shadow: 0px 0px 35px 2px rgba(0, 0, 0, 0.7) !important;
  background-color: rgba(36, 6, 37, 0.644);
}
</style>