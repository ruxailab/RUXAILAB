import firebase from 'firebase'

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
    deleteUserByID: (payload) => {
        console.log("api delete ", payload.id);
    }
}