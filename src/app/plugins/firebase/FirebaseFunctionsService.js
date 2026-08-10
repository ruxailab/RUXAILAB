import { fbFunctions } from '@/app/plugins/firebase'
import { httpsCallable } from 'firebase/functions'

export class FirebaseFunctionsController {
  /**
   * Calls a Firebase Function according to the given name and data.
   *
   * @param {string} functionName The function that will be called.
   * @param {unknown} data Any data that might be passed to the function.
   * @returns A promise that awaits for the function return.
   */
  static async callHttpsCallableFunction(functionName, data) {
    const f = httpsCallable(fbFunctions, functionName)

    return f(data)
  }
}
