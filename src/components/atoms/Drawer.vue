<template>
  <v-navigation-drawer
    :rail="mini"
    permanent
    color="#3F3D56"
    class="hidden-sm-and-down pt-3"
  >
    <!-- Navigation header -->
    <div v-if="!mini">
      <!--- CHANGE CURRENT TEST SELECTOR -->
      <v-list-item>
        <v-row dense>
          <v-col class="pa-0 ma-0">
            <v-select
              class="pa-0 ma-0"
              density="compact"
              item-title="testTitle"
              :items="testsList"
              :model-value="test.testTitle"
              :label="test.testTitle || 'Select a Test'"
              bg-color="#343344"
              style="max-width: 240px"
              @update:model-value="changeTest"
            />
          </v-col>
        </v-row>
      </v-list-item>
    </div>

    <!-- Navigation options -->
    <v-list
      v-if="items"
      density="compact"
    >
      <div v-if="mini">
        <v-tooltip
          v-for="(item, n) in items"
          :key="n"
          location="right"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              @click="go(item)"
            >
              <template #prepend>
                <v-icon :color="$route.path == item.path ? '#fca326' : '#bababa'">
                  {{ item.icon }}
                </v-icon>
              </template>
              <v-list-item-title
                :style="$route.path == item.path ? 'color: #fca326' : 'color:#bababa'"
              >
                {{ $t(`titles.drawer.${item.title}`) }}
              </v-list-item-title>
            </v-list-item>
          </template>
          <span>{{ $t(`titles.drawer.${item.title}`) }}</span>
        </v-tooltip>
      </div>

      <div v-else>
        <v-list-item
          v-for="(item, n) in items"
          :key="n"
          @click="go(item)"
        >
          <template #prepend>
            <v-icon :color="$route.path == item.path ? '#fca326' : '#bababa'">
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title
            :style="$route.path == item.path ? 'color: #fca326' : 'color:#bababa'"
          >
            {{ $t(`titles.drawer.${item.title}`) }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </v-list>

    <!-- Navigation footer -->
    <div
      v-if="!mini"
      class="footer"
    >
      <v-btn
        icon
        class="mr-2"
        @click.stop="mini = !mini"
      >
        <v-icon color="white">
          mdi-chevron-left
        </v-icon>
      </v-btn>
    </div>

    <div
      v-else
      class="footer"
    >
      <v-col>
        <v-btn
          icon
          class="mt-2"
          @click.stop="mini = !mini"
        >
          <v-icon color="white">
            mdi-chevron-right
          </v-icon>
        </v-btn>
      </v-col>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

// Vuex store
const store = useStore();

// Vue Router
const router = useRouter();
const route = useRoute();

// Vue I18n
const { t } = useI18n();

// Reactive state
const mini = ref(true);
const tests = ref([]);

// Computed properties
const test = computed(() => store.state.Tests.Test);
const testsList = computed(() => tests.value);

// Methods
const fetchTests = async () => {
  try {
    await store.dispatch('getTestsAdminByUser');
    tests.value = store.state.Tests.tests;
  } catch (error) {
    console.error('Error fetching tests:', error);
  }
};

const changeTest = async (testName) => {
  const testId = testsList.value.find((t) => t.testTitle === testName)?.testDocId;
  await store.dispatch('getTest', { id: testId });
  router.replace({ name: 'ManagerView', params: { id: testId } });
};

const go = (item) => {
  if (route.path === item.path) return;
  if (item.path === `/testview/${test.value.id}`) return window.open(item.path);
  router.push(item.path);
};

// Lifecycle hook
onMounted(async () => {
  await fetchTests();
});
</script>

<style scoped>
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
}
</style>