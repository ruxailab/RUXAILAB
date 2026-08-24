import { fbFunctions } from '@/app/plugins/firebase'
import { httpsCallable } from 'firebase/functions'

export class FirebaseFunctionsController {
  /**
   * Calls a Firebase Function according to the given name and data.
   *
   * @param {string} functionName The function that will be called.
   * @param {unknown} data Any data that might be passed to the function.
   * @param {{ timeout?: number }} [options] Callable options (timeout in ms).
   * @returns A promise that awaits for the function return.
   */
  static async callHttpsCallableFunction(functionName, data, options = {}) {
    const f = httpsCallable(fbFunctions, functionName, options)

    return f(data)
  }
}
