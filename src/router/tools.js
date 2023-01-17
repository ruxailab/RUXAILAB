import { auth } from "@/firebase";
import store from "@/store/index";
import { onAuthStateChanged } from "firebase/auth";

export async function autoSignIn() {
    if (!store.state.Auth.user) {
        onAuthStateChanged(auth, async (user) => {
            if (user && !store.state.Auth.user) {
                await store.dispatch("autoSignIn", user);
            }
        });
    }
}

export function redirect() {
    if (!store.state.Auth.user) {
        //se nao tiver logado mandar pra landing page
        return "/";
    }

    let level = store.state.Auth.user.accessLevel;

    if (level == 0) {
        return "/superadmin";
    } else if (level == 1) {
        return "/testslist";
    } else {
        return "/home";
    }
}
