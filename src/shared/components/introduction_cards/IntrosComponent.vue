<template>
  <v-card elevation="2" class="pa-4 mb-4" :style="backgroundImage" rounded="xl">
    <div class="background-gradient">
      <v-row
        class="ml-0"
        align="center"
        justify="center"
        style="height: 100%"
      >
        <div class="text-div">
          <h1 class="title-firebase">{{ $t('titles.drawer.' + title) }}</h1>
          <div
            style="font-size: 20px"
            class="text-white mb-4 mobile-center"
          >
            {{ main }}
          </div>
          <v-btn
            class="rounded-lg"
            @click="emitClick"
          >
            {{ $t('pages.intros.click') }}
        </v-btn>
        </div>

        <v-img
          class="hidden-sm-and-down"
          cover
          max-width="30%"
          :src="require('../../../assets/manager/' + image)"
        />
      </v-row>
    </div>
  </v-card>

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
  // Softer gradient: blend colors more gradually
  return `background-image: radial-gradient(circle at top left, ${props.colors[1]} 60%, ${props.colors[0]} 160%);`;
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
  height: 50vh;
}

.learn-text {
  color: rgb(74, 74, 74);
  font-weight: 700;
  font-size: 40px;
  margin-top: 30px;
}

.text-div {
  max-width: 30%;
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


.title-firebase {
    flex-shrink: 0;
    font-family: "Google Sans", sans-serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 44px;
    margin: 0;
    margin-right: 28px;
    color:aliceblue
}
</style>