import api from '@/api'

export default {
    state:{
        user: null
    },
    getters:{
        user(state) {
            return state.user;
        }
    },
    mutations:{
        setUser(state, payload){
            state.user = payload
        }
    },
    actions:{
        async signup(_, payload){
            try {
                await api.auth.signUp(payload)
                //await api.auth.logout()
                console.log("User created :D! ihhaaa")
            } catch (err) {
                console.error("Error when creating user :(", err)
            }
        },
        async signin({commit}, payload) {
            commit('setLoading', true);
            try {
                var user = await api.auth.signIn(payload);
                user = await api.database.getObject({collection: 'users', id: user.uid}); //ainda nao tem na database
                user = Object.assign({uid: user.uid}, user.data());
                commit('setUser', user);
            } catch(err) {
                console.error('Error signing in: ' + err);
            } finally { //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
                commit('setLoading', false);
            }
        },
        async logout({ commit }) {
            try {
              await api.auth.singOut()
              commit('setUser', null)
            } catch (err) {
              console.error('Error logging out.',err)
            }
        }
    }
}