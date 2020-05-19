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
            console.log('user ', state.user);
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
            console.log('payload ' + payload.email + payload.password);
            try {
                var user = await api.auth.signIn(payload);
                // user = await api.database.getObject({collection: 'users', doc: user.uid}); //ainda nao tem na database
                // console.log('user ', user);
                // user = Object.assign({uid: user.uid}, user.data());
                commit('setUser', user);
                console.log('Signed in as ' + user.email);
            }
            catch(err) {
                console.error('Error signing in: ' + err);
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