// imports

import { auth } from "@/firebase";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

export default class AuthController {
    //Register new users

    async authSingUp(email, password) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return user;
            })
            .catch(console.error("Error in SingUp"));
    }

    //SignIn

    async authSingIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password).then(
            (userCredential) => {
                const user = userCredential.user;
                return user;
            }
        );
    }

    //Get Current User

    async authGetCurrentUser() {
        const user = auth.currentUser;
        if (user) {
            console.log("User is signed in");
        } else {
            console.log("User is signed out");
        }
        return user;
    }

    //SignOut

    async authSignOut() {
        return signOut(auth).then(() => {
            console.log("signOut successful");
        });
    }
}
