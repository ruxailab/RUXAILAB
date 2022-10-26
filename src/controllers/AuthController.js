// imports

/* 
import {AuthController} from '././AuthController'

let authController = new AuthController()
*/

// import api from "@/api/index";
import auth from "../api/modules/auth";

export class AuthController {
  async authSingUp(userData) {
    return auth.signUp(userData);
  }
  async authSingIn(userData) {
    return auth.signIn(userData);
  }
  async authGetCurrentUser() {
    return auth.getCurrentUser();
  }
  async authSingOut() {
    return auth.singOut();
  }
}
