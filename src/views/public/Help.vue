<template>
  <div>
    <v-card
      align="center"
      img="https://theme.zdassets.com/theme_assets/717481/e805a01ba4ee2b0b1d0aa58dca3eb97f54c31e95.png"
      height="250"
      elevation="0"
      rounded="0"
    >
      <v-col cols="12" sm="6" md="4" style="user-select: none;">
        <div class="mt-12 display-3 bold font-weight-bold" style="color: white;">
          Help Center
        </div>
        <div class="mt-3 display-2 bold font-weight-bold" style="color: white;">
          How can we help?
        </div>
      </v-col>
    </v-card>
    <v-container>
      <v-row>
        <v-col cols="6">
          <v-list outlined rounded>
            <v-list-item v-for="(item, index) in itemsLeft" :key="index">
              <v-list-item-content>
                <v-list-item-title class="title" @click="toggleCollapse(index)">
                  <v-icon v-if="!item.isCollapsed" small>
                    mdi-chevron-down
                  </v-icon>
                  <v-icon v-else small>
                    mdi-chevron-right
                  </v-icon>
                  {{ item.title }}
                </v-list-item-title>
                <v-expand-transition>
                  <v-row v-if="!item.isCollapsed">
                    <v-col cols="6" align="justify">
                      <div class="subtitle-1 ml-5">
                        {{ item.content }}
                      </div>
                    </v-col>
                    <v-col cols="6" align="center">
                      <div class="px-0">
                        <v-img
                          max-height="250"
                          max-width="400"
                          src="@/assets/CreateTest.gif"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-expand-transition>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="6">
          <v-list outlined rounded>
            <v-list-item v-for="(item, index) in itemsRight" :key="index">
              <v-list-item-content>
                <v-list-item-title
                  class="title"
                  @click="toggleCollapse(index + 5)"
                >
                  <v-icon v-if="!item.isCollapsed" small>
                    mdi-chevron-down
                  </v-icon>
                  <v-icon v-else small>
                    mdi-chevron-right
                  </v-icon>
                  {{ item.title }}
                </v-list-item-title>
                <v-expand-transition>
                  <v-row v-if="!item.isCollapsed">
                    <v-col cols="6" align="justify">
                      <div class="subtitle-1 ml-5">
                        {{ item.content }}
                      </div>
                    </v-col>
                    <v-col cols="6" align="center">
                      <div class="px-0">
                        <v-img
                          max-height="250"
                          max-width="400"
                          src="https://im2.ezgif.com/tmp/ezgif-2-1b8014c1f0.gif"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-expand-transition>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          title: 'How do I create a test?',
          content:
            'To initiate the creation of a heuristic test by clicking on the plus icon, selecting Heuristic Test, specifying project particulars, and proceeding to the dedicated manager page.',
          isCollapsed: true, // Initially collapsed
        },
        {
          title: 'How I setup my Heuristic test?',
          content:
            'To initiate the setup of your Heuristics test you como to edit test and press the plus icon button,add title and the first question to your heuristic, go to options and create the answer options and the values, then save the modifications.',
          isCollapsed: true,
        },
        {
          title: 'How I delete my test?',
          content:
            'To delete your test, tou go to the left bar and goes to options button, and click in DELETE TEST button.',
          isCollapsed: true,
        },
        {
          title: 'How to create a template?',
          content:
            'To create a template of your test, tou go to the left bar and goes to options button, and click in CREATE TEMPLATE button.',
          isCollapsed: true,
        },
        {
          title: 'How to use a template?',
          content:
            'To use a template, you go to the tests page, in templates in PERSONAL is yours templates and explore is the publics.',
          isCollapsed: true,
        },
        {
          title: 'How to create a CSV?',
          content:
            'To create a CSV you go on Edit Test click in .CSV IMPORT button and edit the CSV with your heuristics.',
          isCollapsed: true,
        },
        {
          title: 'How to import my CSV?',
          content:
            'To import a your CSV you go on Edit Test click in UPDATE button and select your CSV file with the heuristics.',
          isCollapsed: true,
        },
        {
          title: 'How to invite cooperators?',
          content:
            'To invite a cooperator you go in your test in manager page and select Cooperators on left bar, click in Select cooperator and write the email of your cooperator, choose the role of the cooperator and send in bottom right.',
          isCollapsed: true,
        },
        {
          title: 'How to analyse the results?',
          content:
            'To analyse your results you go in your test in manager page and select Answers on left bar, and you can visualize statistics, evaluators and heuristics.',
          isCollapsed: true,
        },
        {
          title: 'How to send a message to my cooperators?',
          content:
            'To send a message you go in your test in manager page and select Cooperators on left bar, click on a three dots icon of a cooperator and select Send a message and write a message with Title and Content.',
          isCollapsed: true,
        },
      ],
    }
  },
  computed: {
    itemsLeft() {
      const totalItems = this.items.length
      const halfItems = Math.ceil(totalItems / 2)
      return this.items.slice(0, halfItems)
    },
    itemsRight() {
      const totalItems = this.items.length
      const halfItems = Math.ceil(totalItems / 2)
      return this.items.slice(halfItems)
    },
  },
  methods: {
    toggleCollapse(index) {
      this.items.forEach((item, i) => {
        if (i !== index) {
          item.isCollapsed = true
        }
      })

      this.items[index].isCollapsed = !this.items[index].isCollapsed
    },
  },
}
</script>

<style></style>
