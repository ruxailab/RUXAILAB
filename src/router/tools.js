import store from '@/store/index'
import firebase from 'firebase'

export async function autoSignIn(){
    //debugger
    if(!store.state.auth.user){
        return new Promise((resolve) =>{
            const unsubscribe = firebase.auth().onAuthStateChanged(async (user) =>{
                if(user && !store.state.auth.user){
                    await store.dispatch('autoSignIn',user)
                    resolve(user)
                    return user
                }
                unsubscribe()
            })
        })
    }
}

export function redirect() {
    if(!store.state.auth.user) { //se nao tiver logado mandar pro signin
        return "/signin";
    }

    let level = store.state.auth.user.accessLevel;

    if(level == 0) {
        return "/superadmin"
    } else if(level == 1) {
        return "/";
    } else {
        return "/homeviewquenaoexiste"
    }
}