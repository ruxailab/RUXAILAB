// imports

import auth from "@/api/modules/auth";

let authController = new AuthController()
*/

import api from "@/api/index";

export class AuthController {

  async authSingUp(userData) {
    return auth.signUp(api, userData);
  }
  async authSingIn(userData) {
    return auth.signIn(api, userData);
  }
  async authGetCurrentUser() {
    return auth.getCurrentUser(api);
  }
  async authSingOut() {
    return auth.singOut(api);
  }
  
}
