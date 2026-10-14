import { admin, functions } from '../core/firebase/f.firebase.js'
import logger from '../utils/logger.js'

export const copyTestStructureToStudy = functions.onRequest({
  handler: async (req, res) => {
    const db = admin.firestore()

    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: 'Method not allowed',
        })
      }

      const { sourceStudyId, targetStudyId } = req.body

      if (!sourceStudyId || !targetStudyId) {
        return res.status(400).json({
          error: 'sourceStudyId and targetStudyId are required',
        })
      }

      if (sourceStudyId === targetStudyId) {
        return res.status(400).json({
          error: 'Source and target studies must be different',
        })
      }

      const sourceRef = db.collection('tests').doc(sourceStudyId)
      const targetRef = db.collection('tests').doc(targetStudyId)

      const [sourceSnap, targetSnap] = await Promise.all([
        sourceRef.get(),
        targetRef.get(),
      ])

      if (!sourceSnap.exists) {
        return res.status(404).json({
          error: `Source study ${sourceStudyId} not found`,
        })
      }

      if (!targetSnap.exists) {
        return res.status(404).json({
          error: `Target study ${targetStudyId} not found`,
        })
      }

      const sourceData = sourceSnap.data()
      const targetData = targetSnap.data()

      if (!Array.isArray(sourceData.testStructure)) {
        return res.status(400).json({
          error: 'Source study does not have a valid testStructure array',
        })
      }

      await targetRef.update({
        testStructure: sourceData.testStructure,
      })

      logger.info(
        `Copied testStructure from study ${sourceStudyId} to ${targetStudyId}`,
      )

      return res.status(200).json({
        success: true,
        sourceStudyId,
        targetStudyId,
        testStructureLength: sourceData.testStructure.length,
      })
    } catch (error) {
      logger.error('Error copying testStructure between studies', error)

      return res.status(500).json({
        error: 'Failed to copy testStructure',
      })
    }
  },
})
