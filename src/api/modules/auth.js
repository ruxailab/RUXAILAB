import firebase from 'firebase'
import admin from 'firebase-admin'

export default {
    signUp:(payload) =>{
        var auth = firebase.auth()
        return auth.createUserWithEmailAndPassword(payload.email,payload.password)
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
    },
    deleteUserAuth: (payload) => {
        console.log("api delete ", admin.auth().getUser(payload.id));
        // console.log(payload)
    }
}