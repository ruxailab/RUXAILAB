export class FacialSentimentAnswer {
  constructor({
    Happy = null,
    Sad = null,
    Angry = null,
    Surprised = null,
    Neutral = null,
    Disgusted = null,
    Fearful = null,
    // Legacy camelCase support
    angry = null,
    disgusted = null,
    fearful = null,
    happy = null,
    neutral = null,
    sad = null,
    surprised = null,
  } = {}) {
    this.Happy = Happy ?? happy
    this.Sad = Sad ?? sad
    this.Angry = Angry ?? angry
    this.Surprised = Surprised ?? surprised
    this.Neutral = Neutral ?? neutral
    this.Disgusted = Disgusted ?? disgusted
    this.Fearful = Fearful ?? fearful
  }

  toFirestore() {
    return {
      Happy: this.Happy,
      Sad: this.Sad,
      Angry: this.Angry,
      Surprised: this.Surprised,
      Neutral: this.Neutral,
      Disgusted: this.Disgusted,
      Fearful: this.Fearful,
    }
  }

  static fromObject(data = {}) {
    return new FacialSentimentAnswer(data)
  }
}
