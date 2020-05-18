import api from '@/api'

export default {
    state:{
        user: null
    },
    getters:{},
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
        }
    }
}