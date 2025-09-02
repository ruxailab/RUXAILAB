const state = {
  lang: localStorage.getItem('lang') || 'en', 
};
  
const mutations = {
  SET_LANG(state, lang) {
    state.lang = lang;
    localStorage.setItem('lang', lang); // Persist language in localStorage
  },
};
  
const actions = {
  setLang({ commit }, lang) {
    commit('SET_LANG', lang);
  },
};
  
const getters = {
  lang: (state) => state.lang,
};
  
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};