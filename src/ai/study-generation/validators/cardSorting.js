import { DEFAULT_CARD_SORTING_OPTIONS } from '../schemas/studyDraft.schema'

/**
 * Infers Card Sorting mode from options + categories.
 * @param {{ allow_create_categories?: boolean }} options
 * @param {unknown[]} categories
 * @returns {'closed' | 'open' | 'hybrid'}
 */
export function inferCardSortingMode(options = {}, categories = []) {
  const allowCreate = Boolean(options.allow_create_categories)
  const hasCategories = Array.isArray(categories) && categories.length >= 1

  if (!allowCreate && hasCategories) return 'closed'
  if (allowCreate && !hasCategories) return 'open'
  if (allowCreate && hasCategories) return 'hybrid'
  return 'closed'
}

/**
 * Validates Card Sorting draft content.
 * @param {object} draft
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCardSortingDraft(draft) {
  const errors = []
  const structure = draft?.testStructure

  if (!structure || typeof structure !== 'object' || Array.isArray(structure)) {
    errors.push('testStructure must be an object for CARD_SORTING')
    return { valid: false, errors }
  }

  const cardSorting = structure.cardSorting
  if (!cardSorting || typeof cardSorting !== 'object') {
    errors.push('testStructure.cardSorting is required')
    return { valid: false, errors }
  }

  const cards = cardSorting.cards
  if (!Array.isArray(cards) || cards.length < 1) {
    errors.push('cardSorting.cards must have at least 1 card')
  } else {
    cards.forEach((card, index) => {
      if (!card?.title || String(card.title).trim() === '') {
        errors.push(`cardSorting.cards[${index}] must have a non-empty title`)
      }
    })
  }

  const categories = Array.isArray(cardSorting.categories)
    ? cardSorting.categories
    : []
  const options = {
    ...DEFAULT_CARD_SORTING_OPTIONS,
    ...(cardSorting.options || {}),
  }
  const allowCreate = Boolean(options.allow_create_categories)

  if (!allowCreate) {
    if (categories.length < 1) {
      errors.push('closed Card Sorting requires at least 1 category')
    }
    if (options.allow_create_categories !== false) {
      errors.push('closed Card Sorting requires allow_create_categories === false')
    }
  } else if (categories.length === 0) {
    // open — OK
  } else {
    // hybrid — OK when allowCreate && categories >= 1
  }

  categories.forEach((category, index) => {
    if (!category?.title || String(category.title).trim() === '') {
      errors.push(
        `cardSorting.categories[${index}] must have a non-empty title`,
      )
    }
  })

  return { valid: errors.length === 0, errors }
}
