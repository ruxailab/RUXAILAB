/*
import firebase from 'firebase'

export default {
    signUp: async (payload) =>{
        var auth = firebase.auth()
        await auth.createUserWithEmailAndPassword(payload.email,payload.password)
        return auth.currentUser
    },
    signIn: async (payload) =>{
        var auth = firebase.auth()
        await auth.signInWithEmailAndPassword(payload.email,payload.password)
        return auth.currentUser
    },
    getCurrentUser:() =>{
        var auth = firebase.auth()
        return auth.currentUser
    },
    singOut:() =>{
        var auth = firebase.auth()
        return auth.signOut()
    }
}
*/