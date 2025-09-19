export class CardSortingStudyCard {
  constructor({ title, description, image } = {}) {
    this.title = title;
    this.description = description;
    this.image = image;
  }

  toJson() {
    const json = {}
    if (this.title) json.title = this.title;
    if (this.description) json.description = this.description;
    if (this.image) json.image = this.image;
    return json;
  }
}
