import { fbFunctions } from '@/app/plugins/firebase'
import { connectFunctionsEmulator, httpsCallable } from 'firebase/functions'

const USE_FUNCTIONS_EMULATOR = false

if (USE_FUNCTIONS_EMULATOR) {
  connectFunctionsEmulator(fbFunctions, '127.0.0.1', 5002)
}

export class FirebaseFunctionsController {
  /**
   * Calls a Firebase Function according to the given name and data.
   *
   * @param {string} functionName The function that will be called.
   * @param {unknown} data Any data that might be passed to the function.
   * @param {object} [options] Optional Firebase callable configuration.
   * @returns A promise that awaits for the function return.
   */
  static async callHttpsCallableFunction(functionName, data, options) {
    const f = httpsCallable(fbFunctions, functionName, options)
    return f(data)
  }
}
