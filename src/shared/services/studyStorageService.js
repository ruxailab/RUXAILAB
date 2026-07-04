import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

export async function deleteStudyStorageFile(studyId, path) {
  const response = await FirebaseFunctionsController.callHttpsCallableFunction(
    'deleteStudyStorageFile',
    { studyId, path },
  )
  return response.data
}
