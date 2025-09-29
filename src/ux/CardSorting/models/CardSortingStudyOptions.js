export class CardSortingStudyOptions {
  constructor({ card_description, card_image, category_description, category_image } = {}) {
    this.card_description = card_description || false
    this.card_image = card_image || false

    this.category_description = category_description || null
    this.category_image = category_image || null
  }

  toJson() {
    const json = {}
    if (this.card_description) json.card_description = this.card_description
    if (this.card_image) json.card_image = this.card_image
    if (this.category_description) json.category_description = this.category_description
    if (this.category_image) json.category_image = this.category_image
    return json
  }
}
