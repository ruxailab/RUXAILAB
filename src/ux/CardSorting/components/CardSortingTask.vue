<template>
  <div>
    <ShowInfo :title="props.test.testTitle">
      <template #content>
        <v-divider class="mb-5" />

        <v-container>
          <div class="d-flex align-center justify-center mb-4">
            <p class="text-body-1 mb-0">
              {{ assignedCount }} {{ $t('CardSorting.of') }} {{ totalCards }}
              {{ $t('CardSorting.cards_low') }}
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

          <div class="sorting-board">
            <!-- Unassigned cards pool -->
            <div class="sorting-board__item">
              <div class="sorting-column sorting-column--pool">
                <div class="sorting-column__header">
                  <div class="sorting-column__heading">
                    <v-icon
                      size="20"
                      color="primary"
                      class="sorting-column__heading-icon"
                    >
                      mdi-cards-outline
                    </v-icon>
                    <div class="sorting-column__title-wrap">
                      <h3 class="sorting-column__title">
                        {{ $t('CardSorting.unsortedCards') }}
                      </h3>
                    </div>
                    <span class="sorting-column__badge">
                      {{ pool.length }}
                    </span>
                  </div>
                </div>

                <Draggable
                  :list="pool"
                  item-key="title"
                  class="sorting-column__list"
                  group="cards"
                  ghost-class="sorting-card-ghost"
                  drag-class="sorting-card-drag"
                  @change="onChange"
                >
                  <template #item="{ element }">
                    <CardSortingCard :element="element" :options="options" />
                  </template>
                </Draggable>

                <div v-if="pool.length === 0" class="sorting-column__empty">
                  <v-icon size="28" class="sorting-column__empty-icon">
                    mdi-check-circle-outline
                  </v-icon>
                  <p class="sorting-column__empty-text">
                    {{ $t('CardSorting.allCardsSorted') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div
              v-for="category in localCategories"
              :key="category.id"
              class="sorting-board__item"
            >
              <div class="sorting-column">
                <div
                  class="sorting-column__header sorting-column__header--category"
                >
                  <div class="sorting-column__heading">
                    <v-icon
                      size="20"
                      color="primary"
                      class="sorting-column__heading-icon"
                    >
                      mdi-folder-outline
                    </v-icon>
                    <div class="sorting-column__title-wrap">
                      <h3 class="sorting-column__title">
                        {{ category.title }}
                      </h3>
                      <div
                        v-if="
                          category.description && options.category_description
                        "
                        class="sorting-column__description"
                      >
                        <CategoryDescription :html="category.description" />
                      </div>
                    </div>
                  </div>

                  <div class="sorting-column__meta">
                    <span class="sorting-column__count">
                      {{ categoryCardCount(category.title) }}
                      {{ $t('CardSorting.cards_low') }}
                    </span>
                    <v-chip
                      v-if="allowCreateCategories && !category.isPredefined"
                      size="x-small"
                      color="primary"
                      variant="tonal"
                    >
                      {{ $t('CardSorting.participantCategory') }}
                    </v-chip>
                    <div
                      v-if="allowCreateCategories && !category.isPredefined"
                      class="sorting-column__actions"
                    >
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
                    </div>
                  </div>
                </div>

                <Draggable
                  :list="categoryLists[category.title]"
                  item-key="title"
                  class="sorting-column__list sorting-column__list--category"
                  group="cards"
                  ghost-class="sorting-card-ghost"
                  drag-class="sorting-card-drag"
                  @change="onChange"
                >
                  <template #item="{ element }">
                    <CardSortingCard
                      :element="element"
                      :options="options"
                      compact
                    />
                  </template>
                </Draggable>

                <div class="sorting-column__drop-hint">
                  <v-icon size="22" class="sorting-column__drop-icon">
                    mdi-inbox-arrow-down-outline
                  </v-icon>
                  <p class="sorting-column__drop-text">
                    {{ $t('CardSorting.dropCardsHere') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- New category placeholder -->
            <div v-if="allowCreateCategories" class="sorting-board__item">
              <button
                type="button"
                class="new-category-card"
                @click="openCreateDialog"
              >
                <span class="new-category-card__icon-wrap">
                  <v-icon size="28" color="primary">
                    mdi-folder-plus-outline
                  </v-icon>
                </span>
                <span class="new-category-card__title">
                  {{ $t('CardSorting.newCategory') }}
                </span>
                <span class="new-category-card__subtitle">
                  {{ $t('CardSorting.newCategoryHint') }}
                </span>
              </button>
            </div>
          </div>
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
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import Draggable from 'vuedraggable'
import CardSortingCard from './CardSortingCard.vue'

const ALLOWED_DESCRIPTION_TAGS = new Set([
  'P',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'BR',
  'UL',
  'OL',
  'LI',
])

const renderDescriptionNodes = (nodes) =>
  Array.from(nodes).flatMap((node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent
    if (node.nodeType !== Node.ELEMENT_NODE) return []

    const tag = node.tagName.toUpperCase()
    if (!ALLOWED_DESCRIPTION_TAGS.has(tag)) {
      return renderDescriptionNodes(node.childNodes)
    }

    return h(tag.toLowerCase(), {}, renderDescriptionNodes(node.childNodes))
  })

const CategoryDescription = defineComponent({
  props: {
    html: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const template = document.createElement('template')
      template.innerHTML = props.html
      return renderDescriptionNodes(template.content.childNodes)
    }
  },
})

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

const assignedCount = computed(() => totalCards.value - pool.value.length)

const categoryCardCount = (title) => (categoryLists[title] || []).length

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
.sorting-board {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 16px;
}

.sorting-board__item {
  flex: 1 1 240px;
  max-width: 300px;
  min-width: 0;
}

@media (max-width: 599px) {
  .sorting-board__item {
    flex-basis: 100%;
    max-width: 100%;
  }
}

.sorting-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 280px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0, 33, 63, 0.1);
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 33, 63, 0.05);
}

.sorting-column--pool {
  background: #f8fafc;
}

.sorting-column__header {
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(0, 33, 63, 0.08);
}

.sorting-column__header--category {
  background: rgba(0, 33, 63, 0.04);
}

.sorting-column__heading {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.sorting-column__heading-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.sorting-column__title-wrap {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.sorting-column__title {
  margin: 0;
  color: #00213f;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sorting-column__description {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sorting-column__badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  background: #00213f;
  border-radius: 999px;
}

.sorting-column__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.sorting-column__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.sorting-column__count {
  color: #6b7280;
  font-size: 0.75rem;
}

.sorting-column__list {
  flex: 1;
  min-height: 120px;
  padding: 12px;
}

.sorting-column__list--category {
  padding-bottom: 8px;
}

.sorting-column__empty,
.sorting-column__drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 12px 14px;
  padding: 20px 12px;
  text-align: center;
  border: 2px dashed rgba(0, 33, 63, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
}

.sorting-column__empty-icon,
.sorting-column__drop-icon {
  color: rgba(0, 33, 63, 0.35);
}

.sorting-column__empty-text,
.sorting-column__drop-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.4;
}

.new-category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  min-height: 280px;
  margin: 0;
  padding: 24px 20px;
  cursor: pointer;
  font-family: inherit;
  background: rgba(0, 33, 63, 0.02);
  border: 2px dashed rgba(0, 33, 63, 0.22);
  border-radius: 16px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.new-category-card:hover {
  background: rgba(0, 33, 63, 0.05);
  border-color: rgba(0, 33, 63, 0.4);
  box-shadow: 0 4px 14px rgba(0, 33, 63, 0.08);
}

.new-category-card:focus-visible {
  outline: 2px solid #00213f;
  outline-offset: 2px;
}

.new-category-card__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 4px;
  background: rgba(0, 33, 63, 0.08);
  border-radius: 14px;
}

.new-category-card__title {
  color: #00213f;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
}

.new-category-card__subtitle {
  max-width: 160px;
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.4;
  text-align: center;
}
</style>

<style>
.sorting-card-ghost {
  opacity: 0.45;
}

.sorting-card-drag {
  opacity: 0.95;
  transform: rotate(1deg);
  box-shadow: 0 8px 20px rgba(0, 33, 63, 0.16) !important;
}
</style>
