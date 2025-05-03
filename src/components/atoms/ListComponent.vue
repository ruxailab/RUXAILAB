<template>
  <div>
    <v-list
      v-if="items"
      class="py-0"
    >
      <div
        v-for="(item, n) in sortedItems"
        :key="n"
      >
        <v-list-item
          v-if="item"
          :ripple="false"
          @click="emitClick(item)"
        >
          <!-- Avatar -->
          <v-avatar
            tile
            style="border-radius: 5px"
            size="40"
          >
            <v-avatar
              tile
              :color="generateColor()"
              style="color: #545454"
            >
              <span v-if="type === 'myTemplates' || type === 'publicTemplates'">
                {{
                  item.header &&
                    item.header.templateTitle &&
                    item.header.templateTitle[0]
                    ? item.header.templateTitle[0].toUpperCase()
                    : item.testTitle && item.testTitle[0]
                      ? item.testTitle[0].toUpperCase()
                      : ''
                }}
              </span>
              <span v-else-if="type === 'sessions'">
                {{ item.email[0].toUpperCase() }}
              </span>
              <span v-else>
                {{
                  item.testTitle
                    ? item.testTitle[0].toUpperCase()
                    : item.email[0].toUpperCase()
                }}
              </span>
            </v-avatar>
          </v-avatar>

          <!-- Title -->
          <v-list-item-title
            v-if="type === 'myTemplates' || type === 'publicTemplates'"
          >
            {{ item.header ? item.header.templateTitle : item.testTitle }}
            <v-chip
              label
              variant="outlined"
              style="color: grey"
              size="small"
              class="ml-1"
            >
              {{ item.header ? item.header.templateType : item.testType }}
            </v-chip>
          </v-list-item-title>
          <v-list-item-title v-else-if="type === 'sessions'">
            {{ item.testTitle }}
            <v-chip
              label
              variant="outlined"
              style="color: grey"
              size="small"
              class="ml-1"
            >
              Session
            </v-chip>
          </v-list-item-title>
          <v-list-item-title v-else>
            {{ item.testTitle ? item.testTitle : item.email }}
            <!-- Chip for Test Type -->
            <v-chip
              label
              variant="outlined"
              style="color: grey"
              size="small"
              class="ml-1"
            >
              {{ item.testType ? item.testType : 'User' }}
            </v-chip>
          </v-list-item-title>

          <!-- Subtitle -->
          <v-list-item-subtitle>
            {{ $t('pages.listTests.createdBy') }}
            <strong v-if="type === 'myTests' || type === 'myTemplates'">
              {{ $t('pages.listTests.me') }}
            </strong>
            <strong v-else-if="type === 'sessions'">
              {{ item.testAdmin.email }}
            </strong>
            <strong v-else>
              {{
                item.testAdmin
                  ? item.testAdmin.email
                  : item.header
                    ? item.header.templateAuthor.userEmail
                    : item.testAuthorEmail
              }}
            </strong>
          </v-list-item-subtitle>

          <!-- Actions -->
          <v-list-item-action class="hidden-sm-and-down">
            <v-list-item-action-text
              v-if="item.accessLevel != null && item.accessLevel != undefined"
            />
            <v-list-item-action-text
              v-if="item.updateDate && type != 'sessions'"
            >
              <v-row
                class="ma-0"
                align="center"
              >
                <div class="hidden-sm-and-down">
                  <v-tooltip
                    v-if="type === 'myTests'"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-row
                        v-bind="props"
                        class="ma-0 pa-0 mr-4"
                        align="center"
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
                    <span>{{ $t('titles.cooperators') }}</span>
                  </v-tooltip>
                  <v-tooltip
                    v-else-if="type === 'sharedWithMe'"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-row
                        v-bind="props"
                        class="mr-3"
                      >
                        <div class="text-caption">
                          {{ item.progress }}%
                        </div>
                        <v-progress-circular
                          rotate="-90"
                          :model-value="item.progress"
                          color="grey-darken-1"
                          :size="20"
                          class="ml-1"
                        />
                      </v-row>
                    </template>
                    <span>{{ $t('pages.listTests.progress') }}</span>
                  </v-tooltip>
                </div>
                <div>
                  {{ $t('pages.listTests.updated') }}
                  {{ getFormattedDate(item.updateDate) }}
                </div>
              </v-row>
            </v-list-item-action-text>
            <v-list-item-action-text v-if="type === 'sessions'">
              <v-chip
                variant="outlined"
                class="mb-1 mr-6"
              >
                <span>Scheduled for {{ getFormattedDate(item.testDate) }}</span>
              </v-chip>
            </v-list-item-action-text>
            <v-list-item-action-text
              v-if="type === 'myTemplates' || type === 'publicTemplates'"
            >
              <v-chip
                variant="outlined"
                size="small"
                class="ml-1"
                label
              >
                {{ $t('pages.listTests.version') }}
                {{ item.header ? item.header.templateVersion : '-' }}
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
        >
          {{ $t('pages.listTests.noTests') }}
        </span>
        <span v-else-if="type === 'myTemplates' || type === 'publicTemplates'">
          {{ $t('pages.listTests.noTemplates') }}
        </span>
        <span v-else-if="type === 'sessions'">
          {{ $t('pages.listTests.noSessions') }}
        </span>
      </v-row>
    </v-list>
  </div>
</template>

<script setup>
import { computed, onBeforeUpdate } from 'vue'
import { useI18n } from 'vue-i18n'

// Props definition
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
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
    default: false,
  },
  disablePrevious: {
    type: Boolean,
    default: false,
  },
})

// Emits definition
const emit = defineEmits(['clicked', 'nextPage', 'previousPage'])

// Use vue-i18n
const { t } = useI18n()

// Computed properties
const sortedItems = computed(() => {
  return props.items.slice().sort((a, b) => {
    const dateA = new Date(a.updateDate)
    const dateB = new Date(b.updateDate)
    return dateB - dateA
  })
})

// Lifecycle hooks
onBeforeUpdate(() => {
  const availableTypes = [
    'myTests',
    'publicTests',
    'sharedWithMe',
    'myTemplates',
    'publicTemplates',
    'sessions',
  ]

  if (!availableTypes.includes(props.type)) {
    console.error(props.type + ' type in ListTests.vue is not valid.')
  }
})

// Methods
const getFormattedDate = (date) => {
  const d = new Date(date)
  return d.toLocaleString()
}

const generateColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 80%, 80%)`
}

const emitClick = (item) => {
  emit('clicked', item)
}

const emitNextPage = () => {
  emit('nextPage')
}

const emitPreviousPage = () => {
  emit('previousPage')
}
</script>