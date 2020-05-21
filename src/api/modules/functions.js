import firebase from 'firebase'

export default {
 call: async (payload) =>{
    const func = firebase.functions().httpsCallable(payload.functions)
    return func
 }
}