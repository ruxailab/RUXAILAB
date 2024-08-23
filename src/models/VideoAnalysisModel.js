// src/models/VideoAnalysisModel.js
export default class VideoAnalysis {
  constructor({
    fragment1 = {},
    fragment2 = {},
  } = {}) {
    this.fragment1 = fragment1;
    this.fragment2 = fragment2; 
  }

  static fromFirestore(data) {
    return new VideoAnalysis(data);
  }

  toFirestore() {
    return {
      fragment1: this.fragment1,
      fragment2: this.fragment2,
    };
  }
}
