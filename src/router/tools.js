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