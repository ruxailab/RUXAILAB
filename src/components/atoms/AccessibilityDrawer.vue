<template>
  <v-navigation-drawer
    :rail="mini"
    permanent
    color="#3F3D56"
    class="hidden-sm-and-down pt-3"
  >
    <!-- nav header -->
    <v-list-item
      v-if="!mini"
      class="mb-2 mt-15"
      bg-color="#343344"
    >
      <v-list-item-title>Accessibility Manager</v-list-item-title>
    </v-list-item>
    <v-divider v-if="!mini" />
    <!-- Navigation options -->
    <v-list
      v-if="items"
      density="compact"
      :class="{ 'mt-15': mini }"
    >
      <div v-if="mini">
        <v-tooltip
          v-for="(item, n) in items"
          :key="n"
          location="right"
        >
          <template #activator="{ props: tooltipProps }">
            <v-list-item
              v-bind="tooltipProps"
              @click="go(item)"
            >
              <template #prepend>
                <v-icon :color="isActive(item.path) ? '#fca326' : '#bababa'">
                  {{ item.icon }}
                </v-icon>
              </template>
              <v-list-item-title :style="isActive(item.path) ? 'color: #fca326' : 'color:#bababa'">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </template>
          <span>{{ item.title }}</span>
        </v-tooltip>
      </div>

      <div v-else>
        <v-list-item
          v-for="(item, n) in items"
          :key="n"
          @click="go(item)"
        >
          <template #prepend>
            <v-icon :color="isActive(item.path) ? '#fca326' : '#bababa'">
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title :style="isActive(item.path) ? 'color: #fca326' : 'color:#bababa'">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </v-list>

    <!-- Navigation footer -->
    <div class="footer">
      <v-btn
        variant="flat"
        size="small"
        icon
        class="toggle-button"
        @click.stop="toggleMini"
      >
        <v-icon
          size="large"
          :icon="mini ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        />
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    modelValue: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['update:modelValue', 'toggle']);

const route = useRoute();
const router = useRouter();

const mini = ref(!props.modelValue);

const isActive = (path) => {
    return route.path === path || route.path.startsWith(path + '/');
};

const go = (item) => {
    if (item.path === route.path) return;
    router.push(item.path);
};

const toggleMini = () => {
    mini.value = !mini.value;
    emit('toggle', !mini.value);
};

// Watch for changes in modelValue prop
watch(() => props.modelValue, (newVal) => {
    mini.value = !newVal;
});

// Initialize mini state based on modelValue
mini.value = !props.modelValue;
</script>

<style scoped>
.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px;
    display: flex;
    justify-content: flex-end;
    background-color: inherit;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-button {
    background-color: #fca326 !important;
    color: white !important;
    transition: all 0.3s ease;
}

.toggle-button:hover {
    transform: scale(1.1);
}

.v-navigation-drawer {
    z-index: 5 !important;
    position: fixed !important;
    height: 100vh !important;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>