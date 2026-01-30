<template>
  <v-container class="pa-0 ma-0" fluid>
    <Snackbar />
    <Loading />

    <v-row v-if="test" class="nav pa-0 ma-0" dense>
      <Drawer :items="navigator" />

      <!-- View -->
      <v-col class="background pa-0 ma-0">
        <div v-if="$route.path.includes('manager')">
          <slot>
            <div>
              <ManagerBanner :title="test.testTitle" />
              <v-container class="card-container">
                <div v-if="topCards.length">
                  <div class="presentation-text">
                    {{ $t('common.editAndInvite') }}
                  </div>

                  <!-- Top Cards -->
                  <CardsManager :cards="topCards" :per-row="2" @click="go" />
                </div>

                <div v-if="bottomCards.length">
                  <div class="presentation-text mt-5">
                    {{ $t('common.analyzeProject') }}
                  </div>

                  <!-- Bottom Cards -->
                  <CardsManager :cards="bottomCards" :per-row="2" @click="go" />
                </div>
              </v-container>
            </div>
          </slot>
        </div>

        <router-view />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import Snackbar from '@/shared/components/Snackbar.vue'
import Loading from '@/shared/components/Loading.vue'
import Drawer from '@/shared/components/Drawer.vue'
import ManagerBanner from '@/shared/components/ManagerBanner.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import CardsManager from '@/shared/components/CardsManager.vue'

const props = defineProps({
  navigator: {
    type: Array,
    required: true,
    default: () => [],
  },
  topCards: {
    type: Array,
    required: true,
    default: () => [],
  },
  bottomCards: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// Store
const store = useStore()
const router = useRouter()

// Computed
const test = computed(() => store.getters.test)

// Methods
const go = (item) => {
  if (!item.id) return router.push(item).catch(() => {})
  if (item.id === 2) return window.open(item.path)
  return router.push(item.path).catch(() => {})
}
</script>

<style scoped>
.background {
  background-color: #e8eaf2;
  height: 100%;
  overflow: scroll;
}

.background::-webkit-scrollbar {
  display: none;
}

.testTitle {
  font-style: normal;
  font-weight: bold;
  font-size: 45px;
  display: flex;
  align-items: center;
  text-align: center;
  text-shadow: 2px 2px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.presentation-text {
  color: rgb(87, 84, 100);
  font-weight: 700;
  font-size: 22px;
}

.back-gradient {
  height: 60vh;
  background-image: radial-gradient(circle at top right, #f6cd3d, #fca326);
}
</style>
