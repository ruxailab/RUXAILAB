<template>
  <v-navigation-drawer
    clipped
    v-model="drawer"
    :mini-variant="mini"
    permanent
    color="#3F3D56"
    class="hidden-sm-and-down"
  >
    <!-- Navigation header -->
    <div class="header" v-if="!mini">
      <!--- CHANGE CURRENT TEST SELECTOR -->
      <v-list-item>
        <v-row dense>
          <v-col class="pa-0 ma-0">
            <div class="idText">{{ test.id }}</div>
            <v-overflow-btn
              class="pa-0 ma-0"
              dark
              dense
              item-text="testTitle"
              :items="testsList"
              :label="test.testTitle"
              background-color="#343344"
              style="max-width: 240px"
              @change="changeTest"
            ></v-overflow-btn>
          </v-col>
        </v-row>
      </v-list-item>
    </div>

    <!-- Navigation options -->
    <v-list flat dense v-if="items">
      <div v-if="mini">
        <v-tooltip right v-for="(item, n) in items" :key="n">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              @click=";(currentIndexSelect = n), go(item)"
              v-bind="attrs"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon
                  :color="currentIndexSelect == item.id ? '#fca326' : '#bababa'"
                  >{{ item.icon }}</v-icon
                >
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="
                    currentIndexSelect == item.id
                      ? 'color: #fca326'
                      : 'color:#bababa'
                  "
                  >{{ item.title }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ item.title }}</span>
        </v-tooltip>
      </div>

      <div v-else>
        <v-list-item
          v-for="(item, n) in items"
          :key="n"
          @click=";(currentIndexSelect = n), go(item)"
        >
          <v-list-item-icon>
            <v-icon
              :color="currentIndexSelect == item.id ? '#fca326' : '#bababa'"
              >{{ item.icon }}</v-icon
            >
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title
              :style="
                currentIndexSelect == item.id
                  ? 'color: #fca326'
                  : 'color:#bababa'
              "
              >{{ item.title }}</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>

    <!-- Navigation footer -->
    <div class="footer" v-if="!mini">
      <v-btn
        icon
        @click="go(`/settingsview/${test.id}`)"
        class="ml-3"
        v-if="userAccessLevelOnTest == 0"
      >
        <v-icon :color="isSettingsBtnActive ? '#fca326' : 'white'"
          >mdi-cog</v-icon
        >
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="mini = !mini" class="mr-2">
        <v-icon color="white">mdi-chevron-left</v-icon>
      </v-btn>
    </div>

    <div
      class="footer"
      :style="userAccessLevelOnTest == 0 ? 'height:16%' : ''"
      v-else
    >
      <v-col>
        <v-btn
          icon
          @click="go(`/settingsview/${test.id}`)"
          v-if="userAccessLevelOnTest == 0"
        >
          <v-icon :color="isSettingsBtnActive ? '#fca326' : 'white'"
            >mdi-cog</v-icon
          >
        </v-btn>
        <v-btn icon @click.stop="mini = !mini" class="mt-2">
          <v-icon color="white">mdi-chevron-right</v-icon>
        </v-btn>
      </v-col>
    </div>
  </v-navigation-drawer>
</template>
<script>
export default {
  props: ['userAccessLevelOnTest'],
  data: () => ({
    drawer: true,
    mini: true,
    isSettingsBtnActive: false,
  }),
  methods: {
    async changeTest(testName) {
      const testId = this.testsList.find((t) => t.testTitle === testName)
        ?.testDocId
      await this.$store.dispatch('getTest', { id: testId })
      this.$router.replace({ name: 'ManagerView', params: { id: testId } })
    },
    go(item) {
      if (item.id == undefined) this.$router.push(item).catch(() => {})
      else {
        if (item.id == 2) window.open(item.path)
        else this.$router.push(item.path).catch(() => {})
      }
    },
  },
  computed: {
    test() {
      return this.$store.state.Tests.Test
    },
    testsList() {
      const tests = []

      const testsEntries = Object.entries(this.$store.getters.user.myTests)
      testsEntries.forEach((a) => {
        tests.push(a[1])
      })
      return tests
    },
    currentIndexSelect: {
      get() {
        if (this.items) {
          return this.items.indexOf(
            this.items.find((item) =>
              item.path.split('/').includes(this.$route.path.split('/')[1]),
            ),
          )
        }
        return 0
      },
      set(item) {
        return item
      },
    },
    items() {
      let items
      if (this.test) {
        items = [
          {
            title: 'Manager',
            icon: 'mdi-home',
            path: `/managerview/${this.test.id}`,
            id: 0,
          },
          {
            title: 'Test',
            icon: 'mdi-file-document-edit',
            path: `/edittest/${this.test.id}`,
            id: 1,
          },
        ]

        if (this.userAccessLevelOnTest <= 2) {
          items.push({
            title: 'Preview',
            icon: 'mdi-file-eye',
            path: `/testview/${this.test.id}`,
            id: 2,
          })
        }

        items.push(
          {
            title: 'Reports',
            icon: 'mdi-book-multiple',
            path: `/reportview/${this.test.id}`,
            id: 3,
          },
          {
            title: 'Answers',
            icon: 'mdi-order-bool-ascending-variant',
            path: `/answerview/${this.test.id}`,
            id: 4,
          },
          {
            title: 'Analytics',
            icon: 'mdi-chart-bar',
            path: `/analyticsview/${this.test.id}`,
            id: 5,
          },
          {
            title: 'Final Report',
            icon: 'mdi-file-document',
            path: `/finalreportview/${this.test.id}`,
            id: 6,
          },
        )

        if (this.userAccessLevelOnTest == 0) {
          items.push({
            title: 'Cooperators',
            icon: 'mdi-account-group',
            path: `/cooperators/${this.test.id}`,
            id: 7,
          })
        }

        if (this.test.template) {
          items.push({
            title: 'Template',
            icon: 'mdi-file-compare',
            path: `/templateview/${this.test.template.id}`,
            id: 8,
          })
        }
      }

      return items
    },
  },
}
</script>
