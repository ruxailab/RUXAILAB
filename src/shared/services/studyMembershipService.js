import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export async function manageStudyMembership(payload) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'manageStudyMembership',
    payload,
  )
  return response.data
}
