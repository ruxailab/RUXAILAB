// src/store/modules/VideoAnalysis.js
import VideoAnalysisController from '@/controllers/VideoAnalysisController';

const state = {
  videoAnalysisData: [],
};

const getters = {
  videoAnalysisData: (state) => state.videoAnalysisData,
};

const actions = {
  async fetchVideoAnalysisData({ commit }, docId) {
    try {
      const data = await VideoAnalysisController.fetchVideoAnalysisData(docId);
      commit('SET_VIDEO_ANALYSIS_DATA', [data]); // Ensure data is an array
    } catch (error) {
      console.error('Error fetching video analysis data:', error);
    }
  },
};

const mutations = {
  SET_VIDEO_ANALYSIS_DATA(state, data) {
    state.videoAnalysisData = data;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
