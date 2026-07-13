<template>
  <div>
    <ShowInfo :title="props.test.testTitle">
      <template #content>
        <v-divider class="mb-5" />

        <v-container>
          <div class="d-flex align-center justify-center mb-4">
            <p class="text-body-1 mb-0">
              {{ assignedCount }} {{ $t('CardSorting.of') }}
              {{ totalCards }} {{ $t('CardSorting.cards_low') }}
            </p>
          </div>
          <v-progress-linear
            :model-value="assignedCount"
            color="primary"
            height="10"
            rounded
            :max="totalCards"
            class="mb-6"
          />

          <div
            v-if="allowCreateCategories"
            class="d-flex justify-end mb-4"
          >
            <v-btn
              color="primary"
              variant="tonal"
              rounded="pill"
              prepend-icon="mdi-folder-plus-outline"
              @click="openCreateDialog"
            >
              {{ $t('CardSorting.createCategory') }}
            </v-btn>
          </div>

          <p
            v-if="allowCreateCategories && localCategories.length === 0"
            class="text-body-2 text-medium-emphasis text-center mb-4"
          >
            {{ $t('CardSorting.createCategoryHint') }}
          </p>

          <VRow class="fill-height" justify="center">
            <!-- Unassigned cards pool -->
            <VCol :cols="poolCols" class="mb-0 pb-0">
              <VCard class="card-category">
                <VCardTitle class="d-flex justify-center align-center">
                  <VCol class="text-center">
                    <h3>{{ $t('CardSorting.cards') }}</h3>
                  </VCol>
                </VCardTitle>

                <Draggable
                  :list="pool"
                  item-key="title"
                  class="list-group drop-zone"
                  group="cards"
                  @change="onChange"
                >
                  <template #item="{ element }">
                    <CardSortingCard
                      :element="element"
                      :options="options"
                    />
                  </template>
                </Draggable>
              </VCard>
            </VCol>

            <!-- Categories -->
            <VCol
              v-for="category in localCategories"
              :key="category.id"
              :cols="poolCols"
              class="mb-0 pb-0"
            >
              <VCard class="card-category category">
                <VCardTitle class="d-flex justify-center align-center">
                  <VCol class="text-center">
                    <div class="d-flex align-center justify-center ga-1">
                      <h3 class="mb-0">{{ category.title }}</h3>
                      <template v-if="allowCreateCategories && !category.isPredefined">
                        <v-btn
                          icon
                          variant="text"
                          size="x-small"
                          color="primary"
                          @click="openRenameDialog(category)"
                        >
                          <v-icon size="18">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          variant="text"
                          size="x-small"
                          color="error"
                          @click="removeCategory(category)"
                        >
                          <v-icon size="18">mdi-delete-outline</v-icon>
                        </v-btn>
                      </template>
                    </div>
                    <p
                      v-if="
                        category.description && options.category_description
                      "
                      class="text-caption"
                    >
                      {{ category.description }}
                    </p>
                    <v-chip
                      v-if="allowCreateCategories && !category.isPredefined"
                      size="x-small"
                      color="primary"
                      variant="tonal"
                      class="mt-1"
                    >
                      {{ $t('CardSorting.participantCategory') }}
                    </v-chip>
                  </VCol>
                </VCardTitle>

                <Draggable
                  :list="categoryLists[category.title]"
                  item-key="title"
                  class="list-group drop-zone"
                  group="cards"
                  @change="onChange"
                >
                  <template #item="{ element }">
                    <CardSortingCard
                      :element="element"
                      :options="options"
                    />
                  </template>
                </Draggable>
              </VCard>
            </VCol>
          </VRow>
        </v-container>
      </template>
    </ShowInfo>

    <v-dialog v-model="categoryDialog" max-width="420" persistent>
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h6">
          {{
            editingCategory
              ? $t('CardSorting.renameCategory')
              : $t('CardSorting.createCategory')
          }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="categoryNameInput"
            :label="$t('CardSorting.categoryName')"
            variant="outlined"
            density="comfortable"
            autofocus
            :error-messages="categoryNameError"
            @keyup.enter="confirmCategoryDialog"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeCategoryDialog">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn color="primary" variant="flat" @click="confirmCategoryDialog">
            {{
              editingCategory
                ? $t('buttons.save')
                : $t('CardSorting.createCategory')
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import Draggable from 'vuedraggable'
import CardSortingCard from './CardSortingCard.vue'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'update:pending'])
const { t } = useI18n()

const UNASSIGNED_KEY = '__unassigned'

const cards = computed(
  () => props.test?.testStructure?.cardSorting?.cards || [],
)
const predefinedCategories = computed(
  () => props.test?.testStructure?.cardSorting?.categories || [],
)
const options = computed(
  () => props.test?.testStructure?.cardSorting?.options || {},
)
const allowCreateCategories = computed(
  () => !!options.value.allow_create_categories,
)

const totalCards = computed(() => cards.value.length)

const pool = ref([])
const localCategories = ref([])
const categoryLists = reactive({})

const categoryDialog = ref(false)
const categoryNameInput = ref('')
const categoryNameError = ref('')
const editingCategory = ref(null)

const poolCols = computed(() => {
  const columns = localCategories.value.length + 1
  return Math.max(2, Math.min(4, Math.floor(12 / Math.max(columns, 1))))
})

const assignedCount = computed(() => totalCards.value - pool.value.length)

const buildSorting = () => {
  const sorting = {}
  localCategories.value.forEach((category) => {
    sorting[category.title] = (categoryLists[category.title] || []).map(
      (card) => card.title,
    )
  })
  sorting[UNASSIGNED_KEY] = pool.value.map((card) => card.title)
  return sorting
}

const onChange = () => {
  emit('update:modelValue', buildSorting())
  emit('update:pending', pool.value.length)
}

const ensureList = (title) => {
  if (!categoryLists[title]) {
    categoryLists[title] = []
  }
}

const validateCategoryName = (name, excludeTitle = null) => {
  const trimmed = (name || '').trim()
  if (!trimmed) {
    return t('CardSorting.categoryNameRequired')
  }
  if (trimmed === UNASSIGNED_KEY) {
    return t('CardSorting.categoryNameInvalid')
  }
  const duplicate = localCategories.value.some(
    (category) =>
      category.title.toLowerCase() === trimmed.toLowerCase() &&
      category.title !== excludeTitle,
  )
  if (duplicate) {
    return t('CardSorting.categoryNameDuplicate')
  }
  return ''
}

const openCreateDialog = () => {
  editingCategory.value = null
  categoryNameInput.value = ''
  categoryNameError.value = ''
  categoryDialog.value = true
}

const openRenameDialog = (category) => {
  editingCategory.value = category
  categoryNameInput.value = category.title
  categoryNameError.value = ''
  categoryDialog.value = true
}

const closeCategoryDialog = () => {
  categoryDialog.value = false
  editingCategory.value = null
  categoryNameInput.value = ''
  categoryNameError.value = ''
}

const confirmCategoryDialog = () => {
  const excludeTitle = editingCategory.value?.title ?? null
  const error = validateCategoryName(categoryNameInput.value, excludeTitle)
  if (error) {
    categoryNameError.value = error
    return
  }

  const title = categoryNameInput.value.trim()

  if (editingCategory.value) {
    const oldTitle = editingCategory.value.title
    const cardsInCategory = categoryLists[oldTitle] || []
    delete categoryLists[oldTitle]
    categoryLists[title] = cardsInCategory
    editingCategory.value.title = title
  } else {
    localCategories.value.push({
      id: `participant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      description: '',
      isPredefined: false,
    })
    ensureList(title)
  }

  closeCategoryDialog()
  onChange()
}

const removeCategory = (category) => {
  if (category.isPredefined) return

  const cardsInCategory = categoryLists[category.title] || []
  pool.value.push(...cardsInCategory)
  delete categoryLists[category.title]
  localCategories.value = localCategories.value.filter(
    (item) => item.id !== category.id,
  )
  onChange()
}

const initialize = () => {
  const cardByTitle = new Map(cards.value.map((card) => [card.title, card]))
  const savedSorting = props.modelValue || {}
  const hasSaved = Object.keys(savedSorting).length > 0

  const predefined = predefinedCategories.value.map((category, index) => ({
    id: `predefined-${index}-${category.title}`,
    title: category.title,
    description: category.description || '',
    isPredefined: true,
  }))

  const predefinedTitles = new Set(predefined.map((category) => category.title))
  const participantCategories = []

  if (hasSaved && allowCreateCategories.value) {
    Object.keys(savedSorting).forEach((title) => {
      if (title === UNASSIGNED_KEY || predefinedTitles.has(title)) return
      participantCategories.push({
        id: `participant-${title}`,
        title,
        description: '',
        isPredefined: false,
      })
    })
  }

  localCategories.value = [...predefined, ...participantCategories]
  localCategories.value.forEach((category) => ensureList(category.title))

  if (hasSaved) {
    const usedTitles = new Set()
    localCategories.value.forEach((category) => {
      const titles = savedSorting[category.title] || []
      categoryLists[category.title] = titles
        .filter((title) => cardByTitle.has(title))
        .map((title) => {
          usedTitles.add(title)
          return cardByTitle.get(title)
        })
    })
    pool.value = cards.value.filter((card) => !usedTitles.has(card.title))
  } else {
    localCategories.value.forEach((category) => {
      categoryLists[category.title] = []
    })
    pool.value = [...cards.value]
  }

  emit('update:pending', pool.value.length)
  if (hasSaved) {
    emit('update:modelValue', buildSorting())
  }
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.card-category {
  border-radius: 20px;
  padding: 10px;
  margin: 10px;
}

.category {
  background-color: #f5f5f5;
}

.drop-zone {
  min-height: 120px;
}
</style>
