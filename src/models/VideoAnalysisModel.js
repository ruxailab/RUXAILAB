// src/models/VideoAnalysisModel.js
export default class VideoAnalysis {
  constructor({
    fragment1 = {},
  } = {}) {
    this.fragment1 = fragment1;
  }

  static fromFirestore(data) {
    return new VideoAnalysis(data);
  }

  toFirestore() {
    return {
      fragment1: this.fragment1,
    };
  }
}
