import { auth } from '@/firebase'

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'

export default class AuthController {
    // Register new users
    async signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    // Sign In
    async signIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    // Get Current User
    async getCurrentUser() {
        return auth.currentUser
    }

    // Sign Out
    async signOut() {
        return signOut(auth)
    }
}
