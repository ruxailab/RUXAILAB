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

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    mini: true,
    tests: [],
  }),

  computed: {
    test() {
      return this.$store.state.Tests.Test
    },

    testsList() {
      return this.tests 
    },
  },

  async created() {
    await this.fetchTests() 
  },

  methods: {
    async fetchTests() {
      try {
        await this.$store.dispatch('getTestsAdminByUser'); 
        this.tests = this.$store.state.Tests.tests; 
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    },

    async changeTest(testName) {
      const testId = this.testsList.find(
        (t) => t.testTitle === testName,
      )?.testDocId;
      await this.$store.dispatch('getTest', { id: testId });
      this.$router.replace({ name: 'ManagerView', params: { id: testId } });
    },

    go(item) {
      if (this.$route.path === item.path) return;
      if (item.path === `/testview/${this.test.id}`) return window.open(item.path);
      return this.$router.push(item.path);
    },
  },
}
</script>