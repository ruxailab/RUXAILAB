export default {
  state: {
    test: null
  },
  mutations: {
    test(state,payload){
      state.test=payload
    },
  },
  actions:{
    createTest({dispatch,commit},payload){
      
    }
  }

}
