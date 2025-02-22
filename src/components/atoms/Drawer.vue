<template>
  <v-navigation-drawer clipped :mini-variant="mini" permanent color="#3F3D56" class="hidden-sm-and-down pt-3">
    <!-- Navigation header -->
    <div v-if="!mini">
      <!--- CHANGE CURRENT TEST SELECTOR -->
      <v-list-item>
        <v-row dense>
          <v-col class="pa-0 ma-0">
            <v-overflow-btn
              v-model="selectedTest"
              class="pa-0 ma-0"
              dark
              dense
              item-text="testTitle"
              :items="testsList"
              :label="selectedTest || 'Choose one'"
              background-color="#343344"
              style="max-width: 240px"
              @change="changeTest"
            />
          </v-col>
        </v-row>
      </v-list-item>
    </div>

    <!-- Navigation options -->
    <v-list v-if="items" flat dense>
      <div v-if="mini">
        <v-tooltip v-for="(item, n) in items" :key="n" right>
          <template v-slot:activator="{ on, attrs }">
            <v-list-item v-bind="attrs" @click="go(item)" v-on="on">
              <v-list-item-icon>
                <v-icon :color="$route.path == item.path ? '#fca326' : '#bababa'">
                  {{ item.icon }}
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title 
                  :style="$route.path == item.path ? 'color: #fca326' : 'color:#bababa'"
                >
                  {{ $t(`titles.drawer.${item.title}`) }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ $t(`titles.drawer.${item.title}`) }}</span>
        </v-tooltip>
      </div>

      <div v-else>
        <v-list-item v-for="(item, n) in items" :key="n" @click="go(item)">
          <v-list-item-icon>
            <v-icon :color="$route.path == item.path ? '#fca326' : '#bababa'">
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title 
              :style="$route.path == item.path ? 'color: #fca326' : 'color:#bababa'"
            >
              {{ $t(`titles.drawer.${item.title}`) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>

    <!-- Navigation footer -->
    <div v-if="!mini" class="footer">
      <v-btn icon class="mr-2" @click.stop="mini = !mini">
        <v-icon color="white">
          mdi-chevron-left
        </v-icon>
      </v-btn>
    </div>
    
    <div v-else class="footer">
      <v-col>
        <v-btn icon class="mt-2" @click.stop="mini = !mini">
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
      default: () => []
    }
  },

  data: () => ({
    mini: true,
    selectedTest: null,
  }),

  computed: {
    test() {
      return this.$store.state.Tests.Test;
    },

    testsList() {
      return this.$store.state.Tests.tests || [];
    },
  },

  async created() {
    await this.$store.dispatch('getTestsAdminByUser');
    this.setInitialTest(); 
  },

  methods: {
    setInitialTest() {
      if (this.test && this.test.testTitle) {
        this.selectedTest = this.test.testTitle;
      } else if (this.testsList.length > 0) {
        this.selectedTest = this.testsList[0].testTitle;
      }
    },

    async changeTest(testName) {
      const testId = this.testsList.find(
        (t) => t.testTitle === testName,
      )?.id;
      if (testId) {
        await this.$store.dispatch('getTest', { id: testId });
        this.$router.replace({ name: 'ManagerView', params: { id: testId } });
      } else {
        console.error('Test not found:', testName);
      }
    },

    go(item) {
      if (this.$route.path === item.path) return;
      if (item.path === `/testview/${this.test.id}`) return window.open(item.path);
      return this.$router.push(item.path);
    },
  },
};
</script>