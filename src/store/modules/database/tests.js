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
        payload = Object.assign(payload,{collection:'test'})
        dispatch('createObject',payload)
        .then(() => {
          commit('setAlert',{error: false, msg:'Test created!'})
        })
        .catch(() => {
          commit('setAlert',{error: true, msg:'Error to create test!'})
        })
    }
  }

}
