export default {
  state: {
    test: null,
    tests:null
  },
  mutations: {
    setTest(state,payload){
      state.test=payload
    },
    setTests(state,payload){
      state.tests = payload
    }
  },
  getters:{
    tests(state){
      return state.tests
    },
    test(state){
      return state.test
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
      var tests = await dispatch('getAllObjects',payload)
      commit('setTests',tests)
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
