<template>
  <div>
    <v-card
      align="center"
      img="https://theme.zdassets.com/theme_assets/717481/e805a01ba4ee2b0b1d0aa58dca3eb97f54c31e95.png"
      height="250"
      elevation="0"
      rounded="0"
    >
      <v-col cols="12" sm="6" md="4">
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
                  <v-icon small v-if="!item.isCollapsed"
                    >mdi-chevron-down</v-icon
                  >
                  <v-icon small v-else>mdi-chevron-right</v-icon>
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
                        ></v-img>
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
                  <v-icon small v-if="!item.isCollapsed"
                    >mdi-chevron-down</v-icon
                  >
                  <v-icon small v-else>mdi-chevron-right</v-icon>
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
                        ></v-img>
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
            'Initiate the creation of a heuristic test by clicking on the plus icon, selecting Heuristic Test, specifying project particulars, and proceeding to the dedicated manager page.',
          isCollapsed: true, // Initially collapsed
        },
        {
          title: 'How I setup my test?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How I delete my test?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How to create a template?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How to use a template?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How to create a CSV?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How to import my CSV?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How to invite cooperators?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How to analyse the results?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
          isCollapsed: true,
        },
        {
          title: 'How to send a message to my cooperators?',
          content:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Et repudiandae possimus corrupti voluptatem exercitationem magni quia adipisci animi, praesentium ullam autem nostrum magnam repellat quos sequi officiis ab sapiente! Minima.',
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
