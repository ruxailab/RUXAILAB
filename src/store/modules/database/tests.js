export default {
  state: {
    test: null,
    tests:null,
    loading: false
  },
  mutations: {
    setTest(state,payload){
      state.test=payload
    },
    setTests(state,payload){
      state.tests = payload
    },
    setLoading(state, payload) {
      state.loading = payload;
    }
  },
  getters:{
    tests(state){
      return state.tests
    },
    test(state){
      return state.test
    },
    tasks(state){
      return state.test.tasks
    },
    loading(state) {
      return state.loading
    }
  },
  actions:{
    createTest({dispatch,commit},payload){
        payload = Object.assign(payload,{collection:'test'})
        dispatch('createObject',payload)
        .then(() => {
          commit()
          console.log("Test created!")
          //commit('setAlert',{error: false, msg:'Test created!'})
        })
        .catch(() => {
          console.log("Error to create test!")
          //commit('setAlert',{error: true, msg:'Error to create test!'})
        })
    },
    async getTests({commit,dispatch},payload){
      payload = Object.assign(payload,{collection:'test'})
      commit('setLoading', true);
      var tests = await dispatch('getAllObjects',payload)
      commit('setTests',tests)
      commit('setLoading', false);
    },
    deleteTest({dispatch},payload){
      payload = Object.assign(payload,{collection:'test'})
      return dispatch('deleteObject',payload)
    },
    async getTest({commit,dispatch},payload){
      payload = Object.assign(payload,{collection:'test'})
      var test = await dispatch('getObject',payload)
      commit('setTest',test)
    }
  }

}
