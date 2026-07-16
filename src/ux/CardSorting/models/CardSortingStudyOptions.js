export class CardSortingStudyOptions {
  constructor({
    card_description,
    card_image,
    category_description,
    category_image,
    allow_create_categories,
    hasScreenRecord,
    hasCamRecord,
    hasAudioRecord,
  } = {}) {
    this.card_description = card_description ?? false
    this.card_image = card_image ?? false
    this.category_description = category_description ?? false
    this.category_image = category_image ?? false
    // When true: open (no predefined categories) or hybrid (with predefined ones)
    this.allow_create_categories = allow_create_categories ?? false
    this.hasScreenRecord = hasScreenRecord ?? false
    this.hasCamRecord = hasCamRecord ?? false
    this.hasAudioRecord = hasAudioRecord ?? false
  }

  toJson() {
    return {
      card_description: !!this.card_description,
      card_image: !!this.card_image,
      category_description: !!this.category_description,
      category_image: !!this.category_image,
      allow_create_categories: !!this.allow_create_categories,
      hasScreenRecord: !!this.hasScreenRecord,
      hasCamRecord: !!this.hasCamRecord,
      hasAudioRecord: !!this.hasAudioRecord,
    }
  }
}
