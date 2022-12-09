// imports

/* 
import {AuthController} from '././AuthController'

let authController = new AuthController()
*/

import api from "@/api/index";
import auth from "../api/modules/auth";

export class AuthController {
  async authSignUp(userData) {
    return auth.signUp(api, userData);
  }
  async authSignIn(userData) {
    return auth.signIn(api, userData);
  }
  async authGetCurrentUser() {
    return auth.getCurrentUser(api);
  }
  async authSignOut() {
    return auth.signOut(api);
  }
}
