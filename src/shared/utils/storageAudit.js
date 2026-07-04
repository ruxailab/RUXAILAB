import { getAuth } from 'firebase/auth'

export function getAuditedUploadMetadata() {
  return {
    customMetadata: {
      actorId: getAuth().currentUser?.uid || '',
    },
  }
}
