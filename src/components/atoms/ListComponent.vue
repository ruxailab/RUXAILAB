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
          class="py-3 px-4"
        >
          <template #prepend>
            <v-avatar
              tile
              size="40"
              :color="generateColor()"
              style="border-radius: 5px; color: #545454"
            >
              <span class="font-weight-bold text-body-1">
                {{
                  (item.header?.templateTitle ??
                    item.testTitle ??
                    item.email ??
                    '')[0]?.toUpperCase()
                }}
              </span>
            </v-avatar>
          </template>

          <!-- Main content and chip -->
          <div class="d-flex flex-column flex-grow-1">
            <div class="d-flex align-center">
              <div class="text-body-1 font-weight-medium">
                {{ item.header?.templateTitle ?? item.testTitle ?? item.email }}
              </div>
              <v-chip
                v-if="type !== 'sessions'"
                label
                variant="outlined"
                class="ml-2"
                size="small"
                style="color: grey"
              >
                {{ item.header?.templateType ?? item.testType ?? 'User' }}
              </v-chip>
            </div>

            <div class="text-caption mt-1">
              {{ $t('pages.listTests.createdBy') }}
              <strong class="ml-1">
                {{
                  type === 'myTests' || type === 'myTemplates'
                    ? $t('pages.listTests.me')
                    : item.testAdmin?.email ??
                      item.header?.templateAuthor?.userEmail ??
                      item.testAuthorEmail
                }}
              </strong>
            </div>
          </div>

          <template #append>
            <div class="d-flex flex-column align-end justify-center text-caption mr-2">
              <v-tooltip v-if="type === 'myTests'" location="top">
                <template #activator="{ props }">
                  <v-row
                    v-bind="props"
                    class="ma-0 pa-0"
                    align="center"
                    dense
                  >
                    {{ item.numberColaborators ?? '-' }}
                    <v-icon class="ml-1" size="16">mdi-account-multiple</v-icon>
                  </v-row>
                </template>
                <span>{{ $t('titles.cooperators') }}</span>
              </v-tooltip>

              <div class="mt-1" v-if="item.updateDate && type !== 'sessions'">
                {{ $t('pages.listTests.updated') }}
                {{ getFormattedDate(item.updateDate) }}
              </div>

              <v-chip
                v-if="type === 'sessions'"
                variant="outlined"
                size="small"
                class="mt-1"
              >
                Scheduled for {{ getFormattedDate(item.testDate) }}
              </v-chip>

              <v-chip
                v-if="type === 'myTemplates' || type === 'publicTemplates'"
                variant="outlined"
                size="small"
                class="mt-1"
                label
              >
                {{ $t('pages.listTests.version') }}
                {{ item.header?.templateVersion ?? '-' }}
              </v-chip>
            </div>
          </template>
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