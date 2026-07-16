<template>
  <div class="sorting-card" :class="{ 'sorting-card--compact': compact }">
    <div class="sorting-card__handle">
      <v-icon size="18" class="sorting-card__handle-icon">
        mdi-drag-vertical
      </v-icon>
    </div>

    <div class="sorting-card__body">
      <div class="sorting-card__header">
        <p class="sorting-card__title">
          {{ element.title }}
        </p>

        <v-tooltip v-if="showTooltip" :text="element.tooltip" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-icon v-bind="tooltipProps" size="16" class="sorting-card__info">
              mdi-information-outline
            </v-icon>
          </template>
        </v-tooltip>
      </div>

      <img
        v-if="showImage"
        :src="element.image"
        :alt="element.title"
        class="sorting-card__image"
      />

      <p v-if="showDescription" class="sorting-card__description">
        {{ plainDescription }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  element: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const showTooltip = computed(
  () => !props.compact && props.options.card_tooltip && !!props.element.tooltip,
)

const showImage = computed(
  () => !props.compact && props.options.card_image && !!props.element.image,
)

const showDescription = computed(
  () =>
    !props.compact &&
    props.options.card_description &&
    !!props.element.description,
)

const plainDescription = computed(() => {
  const value = props.element.description || ''
  return value.replace(/<[^>]*>/g, '').trim()
})
</script>

<style scoped>
.sorting-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid rgba(0, 33, 63, 0.1);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 33, 63, 0.06);
  cursor: grab;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
  user-select: none;
}

.sorting-card:hover {
  border-color: rgba(0, 33, 63, 0.22);
  box-shadow: 0 4px 14px rgba(0, 33, 63, 0.1);
}

.sorting-card:active {
  cursor: grabbing;
}

.sorting-card--compact {
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 10px 12px;
  background: rgba(0, 33, 63, 0.03);
  border-color: rgba(0, 33, 63, 0.08);
  box-shadow: none;
}

.sorting-card--compact:hover {
  background: rgba(0, 33, 63, 0.06);
  box-shadow: 0 2px 6px rgba(0, 33, 63, 0.08);
}

.sorting-card__handle {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding-top: 1px;
}

.sorting-card--compact .sorting-card__handle {
  padding-top: 0;
}

.sorting-card__handle-icon {
  color: rgba(0, 33, 63, 0.35);
}

.sorting-card__body {
  min-width: 0;
  flex: 1;
}

.sorting-card__header {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.sorting-card__title {
  margin: 0;
  color: #00213f;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: break-word;
  word-break: normal;
}

.sorting-card--compact .sorting-card__title {
  font-size: 0.875rem;
  font-weight: 600;
}

.sorting-card__info {
  flex-shrink: 0;
  margin-top: 2px;
  color: rgba(0, 33, 63, 0.45);
}

.sorting-card__image {
  display: block;
  width: 100%;
  max-height: 96px;
  margin-top: 10px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(0, 33, 63, 0.08);
}

.sorting-card__description {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.45;
  word-break: break-word;
}
</style>
