<template>
  <v-card
    elevation="2"
    class="rounded-lg"
  >
    <!-- Table Header -->
    <div class="table-header pa-4">
      <v-row
        no-gutters
        class="align-center"
      >
        <v-col
          cols="2"
          class="px-4"
        >
          <div class="text-subtitle-1 font-weight-bold table-heading-text">
            Type
          </div>
        </v-col>
        <v-col
          cols="3"
          class="px-4"
        >
          <div class="text-subtitle-1 font-weight-bold table-heading-text">
            Name
          </div>
        </v-col>
        <v-col
          cols="3"
          class="px-4"
        >
          <div class="text-subtitle-1 font-weight-bold table-heading-text">
            Owner
          </div>
        </v-col>
        <v-col
          cols="2"
          class="px-4"
        >
          <div class="text-subtitle-1 font-weight-bold table-heading-text">
            Participants
          </div>
        </v-col>
        <v-col
          cols="2"
          class="px-4"
        >
          <div class="text-subtitle-1 font-weight-bold table-heading-text">
            Created On
          </div>
        </v-col>
      </v-row>
    </div>
    <v-divider />

    <!-- Table Body -->
    <v-list class="pa-0">
      <template
        v-for="(item, index) in sortedItems"
        :key="index"
      >
        <v-list-item
          class="px-0 py-4"
          @click="emitClick(item)"
        >
          <v-row
            no-gutters
            class="align-center"
          >
            <!-- Type Column with Avatar + Tooltip -->
            <v-col
              cols="2"
              class="px-4"
            >
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    tile
                    size="40"
                    :color="generateColor()"
                    style="border-radius: 5px; color: #545454"
                  >
                    <v-icon size="24">
                      {{ getTypeIcon(item) }}
                    </v-icon>
                  </v-avatar>
                </template>
                <span>
                  {{ item.header?.templateType ?? getTestType(item) }}
                </span>
              </v-tooltip>
            </v-col>

            <!-- Name -->
            <v-col
              cols="3"
              class="px-4"
            >
              <div class="text-subtitle-1 font-weight-medium text-on-surface">
                {{ item.header?.templateTitle ?? item.testTitle ?? item.email }}
              </div>
            </v-col>

            <!-- Owner -->
            <v-col
              cols="3"
              class="px-4"
            >
              <div class="d-flex align-center">
                <v-avatar
                  size="32"
                  class="mr-3"
                >
                  <v-img
                    v-if="getOwnerImage(item)"
                    :src="getOwnerImage(item)"
                    cover
                  />
                  <span
                    v-else
                    class="font-weight-medium"
                  >
                    {{
                      getOwnerName(item)?.[0]?.toUpperCase() ?? 'U'
                    }}
                  </span>
                </v-avatar>
                <span class="text-body-1">
                  {{ getOwnerName(item) }}
                </span>
              </div>
            </v-col>

            <!-- Participants -->
            <v-col
              cols="2"
              class="px-4"
            >
              <div class="d-flex align-center">
                <v-icon
                  size="18"
                  class="mr-1 text-medium-emphasis"
                >
                  mdi-account-multiple
                </v-icon>
                <span class="text-body-1">
                  {{ item.numberColaborators ?? '-' }}
                </span>
              </div>
            </v-col>

            <!-- Creation Date -->
            <v-col
              cols="2"
              class="px-4"
            >
              <div class="text-body-1">
                {{ formatDate(item.createDate || item.updateDate) }}
              </div>
            </v-col>
          </v-row>
        </v-list-item>
        <v-divider v-if="index < sortedItems.length - 1" />
      </template>

      <!-- Empty State -->
      <v-row
        v-if="sortedItems.length === 0"
        justify="center"
        align="center"
        class="ma-0 mt-4 pa-4"
      >
        <span>
          {{
            type === 'myTests' ||
              type === 'publicTests' ||
              type === 'sharedWithMe'
              ? $t('pages.listTests.noTests')
              : type === 'myTemplates' || type === 'publicTemplates'
                ? $t('pages.listTests.noTemplates')
                : $t('pages.listTests.noSessions')
          }}
        </span>
      </v-row>
    </v-list>
  </v-card>
</template>

<script setup>
import { computed, onBeforeUpdate } from 'vue'
import { useI18n } from 'vue-i18n'

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
})

const emit = defineEmits(['clicked'])

const { t } = useI18n()

const sortedItems = computed(() => {
  return props.items.slice().sort((a, b) => {
    const dateA = new Date(a.updateDate)
    const dateB = new Date(b.updateDate)
    return dateB - dateA
  })
})

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-GB') // dd/MM/yyyy
}

const getOwnerName = (item) => {
  if (props.type === 'myTests' || props.type === 'myTemplates') {
    return t('pages.listTests.me')
  }
  return (
    item.testAdmin?.email ??
    item.header?.templateAuthor?.userEmail ??
    item.testAuthorEmail ??
    'Unknown'
  )
}

const getTypeIcon = (item) => {
  const testType = item.testType ?? item.header?.templateType ?? 'USER'
  const subtype = item.userTestType ?? ''

  switch (testType.toUpperCase()) {
    case 'HEURISTICS':
      return 'mdi-clipboard-check'

    case 'USER':
      if (subtype.toUpperCase().includes('UNMODERATED')) {
        return 'mdi-monitor-screenshot'
      }
      if (subtype.toUpperCase().includes('MODERATED')) {
        return 'mdi-account-voice'
      }
      return 'mdi-account'

    default:
      return 'mdi-file-document'
  }
}

const getTestType = (item) => {
  const testType = item.testType ?? item.header?.templateType ?? 'USER'
  const subtype = item.userTestType ?? ''

  switch (testType.toUpperCase()) {
    case 'HEURISTICS':
      return 'HEURISTICS'

    case 'USER':
      if (subtype.toUpperCase().includes('UNMODERATED')) {
        return 'UNMODERATED'
      }
      if (subtype.toUpperCase().includes('MODERATED')) {
        return 'MODERATED'
      }
    
    case 'MANUAL':
      return 'MANUAL'

    case 'AUTOMATIC':
      return 'AUTOMATIC'

    default:
      return 'EMPTY TYPE'
  }
}

const getOwnerImage = (item) => {
  return item.testAdmin?.imageUrl || item.header?.templateAuthor?.imageUrl || null
}

const generateColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 80%, 80%)`
}

const emitClick = (item) => {
  emit('clicked', item)
}

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
</script>

<style scoped>
.v-list-item {
  border-radius: 0 !important;
  transition: background-color 0.2s ease;
}
.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.table-header {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.table-heading-text {
  color: #1F2937 !important;
  font-weight: 700 !important;
}
</style>
