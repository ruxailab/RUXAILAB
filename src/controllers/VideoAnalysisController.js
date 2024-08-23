// src/controllers/VideoAnalysisController.js
import Controller from '@/controllers/BaseController';
import VideoAnalysis from '@/models/VideoAnalysisModel';

const baseController = new Controller();

export default {
  async fetchVideoAnalysisData(docId) {
    try {
      const doc = await baseController.readOne('VideoAnalysis', docId);
      console.log('docid', docId);
      if (doc.exists()) {
        console.log('doc', doc.data());
        return VideoAnalysis.fromFirestore(doc.data());
      } else {
        throw new Error('Document does not exist');
      }
    } catch (error) {
      console.error('Error fetching video analysis data:', error);
      throw error;
    }
  }
};
