import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export async function recordReportDownload(studyId) {
  return FirebaseFunctionsController.callHttpsCallableFunction(
    'recordReportDownload',
    { studyId },
  )
}
