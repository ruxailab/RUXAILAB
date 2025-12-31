function normalizeLang(l) {
  if (!l) return 'en';
  return String(l).toLowerCase().replace('-', '_');
}

const state = {
  lang: normalizeLang(localStorage.getItem('lang')) || 'en', 
};
  
const mutations = {
  SET_LANG(state, lang) {
    const normalized = normalizeLang(lang);
    state.lang = normalized;
    localStorage.setItem('lang', normalized); // Persist language in localStorage
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