export class FacialSentimentAnswer {
  constructor({
    angry = null,
    disgusted = null,
    fearful = null,
    happy = null,
    neutral = null,
    sad = null,
    surprised = null,
  } = {}) {
    this.angry = angry
    this.disgusted = disgusted
    this.fearful = fearful
    this.happy = happy
    this.neutral = neutral
    this.sad = sad
    this.surprised = surprised
  }

  toFirestore() {
    return {
      angry: this.angry,
      disgusted: this.disgusted,
      fearful: this.fearful,
      happy: this.happy,
      neutral: this.neutral,
      sad: this.sad,
      surprised: this.surprised,
    }
  }

  static fromObject(data = {}) {
    return new FacialSentimentAnswer(data)
  }
}
