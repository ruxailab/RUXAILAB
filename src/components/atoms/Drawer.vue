<template>
  <v-navigation-drawer
    v-model="drawer"
    clipped
    :mini-variant="mini"
    permanent
    color="#3F3D56"
    class="hidden-sm-and-down"
  >
    <!-- Navigation header -->
    <div v-if="!mini" class="header">
      <!--- CHANGE CURRENT TEST SELECTOR -->
      <v-list-item>
        <v-row dense>
          <v-col class="pa-0 ma-0">
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
            <v-list-item
              v-bind="attrs"
              @click=";(currentIndexSelect = n), go(item)"
              v-on="on"
            >
              <v-list-item-icon>
                <v-icon
                  :color="currentIndexSelect == item.id ? '#fca326' : '#bababa'"
                >
                  {{ item.icon }}
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title
                  :style="
                    currentIndexSelect == item.id
                      ? 'color: #fca326'
                      : 'color:#bababa'
                  "
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
        <v-list-item
          v-for="(item, n) in items"
          :key="n"
          @click=";(currentIndexSelect = n), go(item)"
        >
          <v-list-item-icon>
            <v-icon
              :color="currentIndexSelect == item.id ? '#fca326' : '#bababa'"
            >
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title
              :style="
                currentIndexSelect == item.id
                  ? 'color: #fca326'
                  : 'color:#bababa'
              "
            >
              {{ $t(`titles.drawer.${item.title}`) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>

    <!-- Navigation footer -->
    <div v-if="!mini" class="footer">
      <v-btn
        v-if="userAccessLevelOnTest == 0"
        icon
        class="ml-3"
        @click="go(`/settingsview/${test.id}`)"
      >
        <v-icon :color="isSettingsBtnActive ? '#fca326' : 'white'">
          mdi-cog
        </v-icon>
      </v-btn>
      <v-spacer />
      <v-btn icon class="mr-2" @click.stop="mini = !mini">
        <v-icon color="white">
          mdi-chevron-left
        </v-icon>
      </v-btn>
    </div>

    <div
      v-else
      class="footer"
      :style="userAccessLevelOnTest == 0 ? 'height:16%' : ''"
    >
      <v-col>
        <v-btn
          v-if="userAccessLevelOnTest == 0"
          icon
          @click="go(`/settingsview/${test.id}`)"
        >
          <v-icon :color="isSettingsBtnActive ? '#fca326' : 'white'">
            mdi-cog
          </v-icon>
        </v-btn>
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
  props: ['userAccessLevelOnTest'],
  data: () => ({
    drawer: true,
    mini: true,
    isSettingsBtnActive: false,
  }),
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
        ]

        if (this.userAccessLevelOnTest <= 2) {
          if (this.userAccessLevelOnTest == 0) {
            items.push(
              {
                title: 'Test',
                icon: 'mdi-file-document-edit',
                path: `/edittest/${this.test.id}`,
                id: 1,
              },
              {
                title: 'Preview',
                icon: 'mdi-file-eye',
                path: `/testview/${this.test.id}`,
                id: 2,
              },
            )
          } else if (this.userAccessLevelOnTest == 1) {
            items.push({
              title: 'Answer Test',
              icon: 'mdi-file-document',
              path: `/testview/${this.test.id}`,
              id: 1,
            })
          }
        }
        if (this.userAccessLevelOnTest == 0) {
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
          )
        } else if (this.userAccessLevelOnTest == 1) {
          items.push(
            {
              title: 'Reports',
              icon: 'mdi-book-multiple',
              path: `/reportview/${this.test.id}`,
              id: 2,
            },
            {
              title: 'Answers',
              icon: 'mdi-order-bool-ascending-variant',
              path: `/answerview/${this.test.id}`,
              id: 3,
            },
            {
              title: 'Analytics',
              icon: 'mdi-chart-bar',
              path: `/analyticsview/${this.test.id}`,
              id: 4,
            },
          )
        }
        if (this.userAccessLevelOnTest == 0) {
          items.push(
            {
              title: 'Final Report',
              icon: 'mdi-file-document',
              path: `/finalreportview/${this.test.id}`,
              id: 6,
            },
            {
              title: 'Cooperators',
              icon: 'mdi-account-group',
              path: `/cooperators/${this.test.id}`,
              id: 7,
            },
          )
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
  methods: {
    async changeTest(testName) {
      const testId = this.testsList.find(
        (t) => t.testTitle === testName,
      )?.testDocId
      await this.$store.dispatch('getTest', { id: testId })
      this.$router.replace({ name: 'ManagerView', params: { id: testId } })
    },
    go(item) {
      if (item.id == undefined) this.$router.push(item).catch(() => {})
      else {
        if (item.path == `/testview/${this.test.id}`) window.open(item.path)
        else this.$router.push(item.path).catch(() => {})
      }
    },
  },
}
</script>
