<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    :rail="miniMode && mdAndUp"
    :temporary="!mdAndUp"
    :permanent="mdAndUp"
    color="primary"
    class="pt-3"
  >
    <!-- Navigation header 
    <div v-if="!mini">
      <v-list-item>
        <h3>{{ test.testTitle }}</h3>
      </v-list-item>
    </div>
-->
    <!-- Navigation options -->
    <v-list v-if="items" density="compact">
      <template v-for="group in groupedItems" :key="group.id">
        <v-list-subheader v-if="group.title" class="navigation-group">
          {{ $t(`navigation.groups.${group.title}`) }}
        </v-list-subheader>
        <v-list-item
          v-for="item in group.items"
          :key="item.path"
          @click="go(item)"
        >
          <template #prepend>
            <v-icon :color="isActive(item) ? '#ff5c6d' : '#bababa'">
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title
            :style="isActive(item) ? 'color: #ff5c6d' : 'color:#bababa'"
          >
            {{ $t(`titles.drawer.${item.title}`) }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>

    <div v-if="mdAndUp" class="footer">
      <v-btn
        icon
        size="small"
        class="mr-2 coral-button"
        :aria-label="$t('titles.drawer.toggleMiniMode')"
        @click.stop="toggleMiniMode"
      >
        <v-icon color="white">
          {{ miniMode ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
        </v-icon>
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const store = useStore()
const router = useRouter()
const route = useRoute()
const { mdAndUp, mobile } = useDisplay()

const drawerOpen = ref(false)
const miniMode = ref(false)
const test = computed(() => store.state.Tests.Test)

const groupedItems = computed(() => {
  const groupOrder = [
    'overview',
    'evaluation',
    'people',
    'analysis',
    'administration',
  ]
  const groups = new Map()

  for (const item of props.items) {
    const groupId = item.group || `ungrouped-${groups.size}`
    const group = groups.get(groupId) || {
      id: groupId,
      title: item.group,
      items: [],
    }
    group.items.push(item)
    groups.set(groupId, group)
  }

  return [...groups.values()].sort((firstGroup, secondGroup) => {
    const firstIndex = groupOrder.indexOf(firstGroup.id)
    const secondIndex = groupOrder.indexOf(secondGroup.id)
    return (
      (firstIndex === -1 ? groupOrder.length : firstIndex) -
      (secondIndex === -1 ? groupOrder.length : secondIndex)
    )
  })
})

const initialDrawerState = computed(() => {
  return mdAndUp.value
})

onMounted(() => {
  drawerOpen.value = initialDrawerState.value
})

const go = (item) => {
  if (!item?.path) return
  if (route.path === item.path) return
  const testId = test.value?.id
  if (testId && item.path === `/testview/${testId}`)
    return window.open(item.path)
  router.push(item.path)
  if (mobile.value) {
    drawerOpen.value = false
  }
}

const isActive = (item) => {
  if (!item?.path) return false
  if (route.path === item.path) return true
  return router.resolve(item.path).name === route.name
}

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}
const toggleMiniMode = () => {
  miniMode.value = !miniMode.value
}

onMounted(() => {
  globalThis.addEventListener('toggle-dashboard-drawer', toggleDrawer)
})

onUnmounted(() => {
  globalThis.removeEventListener('toggle-dashboard-drawer', toggleDrawer)
})
</script>

<style scoped>
.navigation-group {
  color: #bababa !important;
  position: relative;
}

.navigation-group::after {
  position: absolute;
  right: 16px;
  bottom: 0;
  left: 16px;
  border-bottom: 1px solid #bababa;
  content: '';
}

.footer {
  position: absolute;
  bottom: 10px;
  width: auto;
  padding: 10px;
}

.coral-button {
  background-color: #ff5c6d !important;
}
</style>
