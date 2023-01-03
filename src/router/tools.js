import { auth } from "@/firebase";
import store from "@/store/index";
<<<<<<< HEAD
import { auth } from "../firebase";
import {onAuthStateChanged} from "firebase/auth";

export async function autoSignIn(){
    if (!store.state.auth.user){
      onAuthStateChanged(auth, async (user) =>{
        if (user && !store.state.auth.user){
          await store.dispatch("autoSignIn", user)
        }
      })
    }
=======
import { onAuthStateChanged } from "firebase/auth";

export async function autoSignIn() {
  if (!store.state.auth.user) {
    onAuthStateChanged(auth, async (user) => {
      if (user && !store.state.auth.user) {
        await store.dispatch("autoSignIn", user);
      }
    });
>>>>>>> develop
  }
}

export function redirect() {
  if (!store.state.auth.user) {
    //se nao tiver logado mandar pra landing page
    return "/";
  }

  let level = store.state.auth.user.accessLevel;

  if (level == 0) {
    return "/superadmin";
  } else if (level == 1) {
    return "/testslist";
  } else {
    return "/home";
  }
}
