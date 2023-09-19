<template>
  <div>
    <v-list v-if="items" class="py-0">
      <div v-for="(item, n) in sortedItems" :key="n">
        <v-list-item v-if="item" :ripple="false" @click="emitClick(item)">
          <!-- Avatar -->
          <v-list-item-avatar tile style="border-radius: 5px" size="40">
            <v-avatar tile :color="generateColor()" style="color: #545454">
              <span
                v-if="type === 'myTemplates' || type === 'publicTemplates'"
                >{{ item.header.templateTitle[0].toUpperCase() }}</span
              >
              <span v-else>{{ item.testTitle[0].toUpperCase() }}</span>
            </v-avatar>
          </v-list-item-avatar>

          <v-list-item-content>
            <!-- Title -->
            <v-list-item-title
              v-if="type === 'myTemplates' || type === 'publicTemplates'"
            >
              {{ item.header.templateTitle }}
              <v-chip label outlined style="color: grey" small class="ml-1">
                {{ item.header.templateType }}
              </v-chip>
            </v-list-item-title>
            <v-list-item-title v-else>
              {{ item.testTitle }}
              <!-- Tales -->
              <v-chip label outlined style="color: grey" small class="ml-1">
                {{ item.testType }}
              </v-chip>
            </v-list-item-title>

            <!-- Subtitle -->
            <v-list-item-subtitle>
              Created by
              <strong v-if="type === 'myTests' || type === 'myTemplates'">
                Me
              </strong>
              <strong v-else>{{
                item.testAdmin
                  ? item.testAdmin.email
                  : item.header
                  ? item.header.templateAuthor.userEmail
                  : ''
              }}</strong>
            </v-list-item-subtitle>
            <div
              class="hidden-sm-and-down"
              style="position: absolute; right: 25%"
            >
              <v-tooltip v-if="type === 'myTests'" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-row
                    class="ma-0 pa-0"
                    v-bind="attrs"
                    align="center"
                    v-on="on"
                  >
                    {{
                      item.numberColaborators >= 0
                        ? item.numberColaborators
                        : '-'
                    }}
                    <v-icon class="ml-1">
                      mdi-account-multiple
                    </v-icon>
                  </v-row>
                </template>
                <span>Cooperators</span>
              </v-tooltip>
              <v-tooltip v-else-if="type === 'sharedWithMe'" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-row v-bind="attrs" v-on="on">
                    <div class="caption">{{ item.progress }}%</div>

                    <v-progress-circular
                      rotate="-90"
                      :value="item.progress"
                      color="grey darken-1"
                      :size="20"
                      class="ml-1"
                    />
                  </v-row>
                </template>
                <span>Progress</span>
              </v-tooltip>
            </div>
          </v-list-item-content>

          <!-- Actions -->
          <v-list-item-action class="hidden-sm-and-down">
            <v-list-item-action-text
              v-if="item.accessLevel != null && item.accessLevel != undefined"
            >
              <v-chip
                label
                outlined
                class="my-1"
                :color="getAccessLevelColor(item.accessLevel)"
              >
                {{ getAccessLevelText(item.accessLevel) }}
              </v-chip>
            </v-list-item-action-text>
            <v-list-item-action-text v-if="item.updateDate">
              Last Updated on
              {{ getFormattedDate(item.updateDate) }}
            </v-list-item-action-text>
            <v-list-item-action-text
              v-if="type === 'myTemplates' || type === 'publicTemplates'"
            >
              <v-chip outlined small class="ml-1" label>
                Version: {{ item.header.templateVersion }}
              </v-chip>
            </v-list-item-action-text>
          </v-list-item-action>
        </v-list-item>
        <v-divider v-if="n !== items.length - 1" />
      </div>

      <v-row
        v-if="items.length <= 0"
        justify="center"
        align="center"
        class="ma-0 mt-2 pa-0"
      >
        <span
          v-if="
            type === 'myTests' ||
              type === 'publicTests' ||
              type === 'sharedWithMe'
          "
          >No tests found</span
        >
        <span v-else-if="type === 'myTemplates' || type === 'publicTemplates'"
          >No templates found</span
        >
      </v-row>
    </v-list>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
      default: function() {
        return []
      },
    },
    type: {
      type: String,
      required: true,
    },
    hasPagination: {
      type: Boolean,
      default: false,
    },
    disableNext: {
      type: Boolean,
    },
    disablePrevious: {
      type: Boolean,
    },
  },
  data: () => ({}),
  computed: {
    // Compute the sorted items based on the updateDate property in descending order
    sortedItems() {
      return this.items.slice().sort((a, b) => {
        // Parse the update dates as Date objects
        const dateA = new Date(a.updateDate)
        const dateB = new Date(b.updateDate)

        // Sort in descending order
        return dateB - dateA
      })
    },
  },
  beforeUpdate() {
    const availableTypes = [
      'myTests',
      'publicTests',
      'sharedWithMe',
      'myTemplates',
      'publicTemplates',
    ]

    if (!availableTypes.includes(this.type)) {
      console.error(this.type + ' type in ListTests.vue is not valid.')
    }
  },
  methods: {
    getFormattedDate(date) {
      const d = new Date(date)
      return d.toLocaleString()
    },
    getAccessLevelText(accessLevel) {
      return accessLevel === 0
        ? 'Administrator'
        : accessLevel === 1
        ? 'Evaluator'
        : 'Guest'
    },
    getAccessLevelColor(accessLevel) {
      return accessLevel === 0
        ? 'primary'
        : accessLevel === 1
        ? 'secondary'
        : 'warning'
    },
    generateColor() {
      const hue = Math.floor(Math.random() * 360)
      const color = 'hsl(' + hue + ', 80%, 80%)'

      return color
    },
    emitClick(item) {
      this.$emit('clicked', item)
    },
    emitNextPage() {
      this.$emit('nextPage')
    },
    emitPreviousPage() {
      this.$emit('previousPage')
    },
  },
}
</script>
