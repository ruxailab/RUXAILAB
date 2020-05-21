export default {
    state: {
        users: null
    },
    mutations: {
        setUsers(state, payload) {
            state.users = payload;
        }
    },
    actions: {
        async getUsers({commit, dispatch}, payload) {
            commit('setLoading', true);
            payload = Object.assign(payload, {collection:'users'}); //adiciona collection ao objeto passado
            var users = await dispatch('getAllObjects', payload); //chama action que retorna tudo que tem na collection do objeto passado
            commit('setUsers', users); //guarda o array na users da store
            commit('setLoading', false);
        },
        async updateLevel({commit, dispatch},payload){
            commit('setLoading', true);
            payload = Object.assign(payload,{function:'setUserRole'})
            await dispatch('callFunction',payload);
            dispatch('getUsers', {});
        }
    }
}