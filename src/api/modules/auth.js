import { auth } from "../../firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"

export default {
    signUp: async (payload) =>{
        await createUserWithEmailAndPassword(payload.email,payload.password)
        return auth.currentUser
    },
    signIn: async (payload) =>{
        await signInWithEmailAndPassword(payload.email,payload.password)
        return auth.currentUser
    },
    getCurrentUser:() =>{
        return auth.currentUser
    },
    singOut:() =>{
        return signOut()
    }
}