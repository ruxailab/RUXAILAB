import store from "@/store/index";
// import firebase from "firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/index";

export async function autoSignIn() {
  if (!store.state.auth.user)
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user && !store.state.auth.user) {
          await store.dispatch("autoSignIn", user);
          resolve(user);
          return user;
        }
        unsubscribe();
        resolve(null);
        return null;
      });
    });
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
