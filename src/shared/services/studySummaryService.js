import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export async function requestStudySummaryPdf(studyId) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'generateStudySummary',
    { studyId },
  )
  const binary = window.atob(response.data.pdf)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}
