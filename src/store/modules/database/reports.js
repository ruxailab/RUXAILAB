export default {
    state:{
        reports: null
    },
    getters:{

    },
    mutations:{
        setReports(state,payload){
            state.reports = payload
        }
    },
    actions:{
        createReport({dispatch},payload){
            payload = Object.assign(payload, {collection: "reports"})
            let docRef = dispatch("createObject",payload)
            .then((doc)=>{
                return doc.id
            })
            .catch((err)=>{
                console.error("Error to create report ", err)
            })
            return docRef
        },
        deleteReport({ dispatch }, payload) {
            payload = Object.assign(payload, {collection: "reports"});
            dispatch('deleteObject', payload)
            .catch((err) => {
                console.error('Error ', err);
            })
        },
        async getReports({ dispatch, commit }, payload) {
            payload = Object.assign(payload, {collection: 'reports'});
            
            let reps = await dispatch('getObject', payload);
            commit('setReports', reps);
        },
        pushLog({ dispatch }, payload) {
            payload = Object.assign(payload, {collection: 'reports', param: 'reports'});

            dispatch('pushObject', payload)
            .catch((err) => {
                console.error('Error pushing log ', err);
            })
        }
    }
}