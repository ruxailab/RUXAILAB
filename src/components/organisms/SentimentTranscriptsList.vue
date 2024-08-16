<template>
    <v-container>
      <!-- Header -->
      <v-row>
        <v-col cols="12">
          <h3>Transcripts</h3>
          <v-divider />
        </v-col>
      </v-row>

      <!-- Scrollable List -->
      <v-row>
        <v-col cols="12">
        <v-list two-line>
          <v-list-item-group
            v-model="selected"
            active-class="orange--text"
            class="scrollable-list"
          >
            <template v-for="(item, index) in items">
              <v-list-item :key="item.title">
                <template v-slot:default="{ active }">
                  <v-list-item-content>
                    <v-list-item-title v-text="item.title"></v-list-item-title>

                    <v-list-item-subtitle
                      class="text--primary"
                      v-text="item.headline"
                    ></v-list-item-subtitle>

                    <v-list-item-subtitle v-text="item.subtitle"></v-list-item-subtitle>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-list-item-action-text v-text="item.action"></v-list-item-action-text>

                    <v-icon
                      v-if="!active"
                      color="grey lighten-1"
                    >
                      mdi-star-outline
                    </v-icon>

                    <v-icon
                      v-else
                      color="yellow darken-3"
                    >
                      mdi-star
                    </v-icon>
                  </v-list-item-action>
                </template>
              </v-list-item>

              <v-divider
                v-if="index < items.length - 1"
                :key="index"
              ></v-divider>
            </template>
          </v-list-item-group>
        </v-list>

        </v-col>
      </v-row>  
    </v-container>
</template>


<script>
import { computed } from 'vue-clamp';

// import SentimentTranscript from '@/components/molecules/SentimentTranscript.vue';

export default {
  components: {
    // SentimentTranscript,
  },
  props: {
    regions: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
      selected: [2],
      items: [
        {
          action: '15 min',
          headline: 'Brunch this weekend?',
          subtitle: `I'll be in your neighborhood doing errands this weekend. Do you want to hang out?`,
          title: 'Ali Connors',
        },
        {
          action: '2 hr',
          headline: 'Summer BBQ',
          subtitle: `Wish I could come, but I'm out of town this weekend.`,
          title: 'me, Scrott, Jennifer',
        },
        {
          action: '6 hr',
          headline: 'Oui oui',
          subtitle: 'Do you have Paris recommendations? Have you ever been?',
          title: 'Sandra Adams',
        },
        {
          action: '12 hr',
          headline: 'Birthday gift',
          subtitle: 'Have any ideas about what we should get Heidi for her birthday?',
          title: 'Trevor Hansen',
        },
        {
          action: '18hr',
          headline: 'Recipe to try',
          subtitle: 'We should eat this: Grate, Squash, Corn, and tomatillo Tacos.',
          title: 'Britta Holt',
        },
      ],
    }),
}
</script>



<style scoped>
h3 {
  font-style: normal;
  font-weight: 300;
  color: #000000;
}


.scrollable-list {
  /* background-color: red; */
  height: 250px;
  overflow-y: auto;
  /* Custom scrollbar styles */
  scrollbar-width: thin; /* For Firefox */
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent; /* For Firefox */
}

.scrollable-list::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar */
}

.scrollable-list::-webkit-scrollbar-track {
  background: transparent; /* Track background */
}

.scrollable-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3); /* Scrollbar color */
  border-radius: 10px; /* Rounded corners */
}

.scrollable-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5); /* Darker color on hover */
}
</style>