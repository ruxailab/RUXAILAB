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
        async signup({commit}, payload){
            commit('setLoading', true);
            try {
                await api.auth.signUp(payload)
                //await api.auth.logout()
                console.log("User created :D! ihhaaa")
                commit('setUser', payload);
            } catch (err) {
                console.error("Error when creating user :(", err)
            } finally { //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
                commit('setLoading', false);
            }
        },
        async signin({commit}, payload) {
            commit('setLoading', true);
            try {
                var user = await api.auth.signIn(payload);
                // user = await api.database.getObject({collection: 'users', doc: user.uid}); //ainda nao tem na database
                // console.log('user ', user);
                // user = Object.assign({uid: user.uid}, user.data());
                commit('setUser', user);
                console.log('Signed in as ' + user.email);
            } catch(err) {
                console.error('Error signing in: ' + err);
            } finally { //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
                commit('setLoading', false);
            }
        },
        async logout({ commit }) {
            try {
              await api.auth.singOut();
              console.log('Signed Out');
              commit('setUser', null);
            } catch (err) {
              console.error('Error logging out.',err);
            }
        }
    }
}