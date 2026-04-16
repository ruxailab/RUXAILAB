import { admin, functions } from '../f.firebase.js'
import logger from '../utils/logger.js'

function sortHeuristics(heuristicAnswers) {
  const updated = {}

  for (const [userId, userData] of Object.entries(heuristicAnswers || {})) {
    const sortedHeuristics = [...(userData.heuristicQuestions || [])]
      .sort((a, b) => a.heuristicId - b.heuristicId)
      .map((heuristic) => ({
        ...heuristic,
        heuristicQuestions: [...(heuristic.heuristicQuestions || [])].sort(
          (a, b) => a.heuristicId - b.heuristicId,
        ),
      }))

    updated[userId] = {
      ...userData,
      heuristicQuestions: sortedHeuristics,
    }
  }

  return updated
}

export const orderHeuristics = functions.onRequest({
  handler: async (req, res) => {
    try {
      console.log('🚀 start order heuristics')

      const ids = ['IafkDenRiN6Evgwz1QfS', 'IHf6DTOt51GfnNXc12Ny']
      const db = admin.firestore()

      const results = await Promise.all(
        ids.map(async (id) => {
          const ref = db.collection('answers').doc(id)
          const snap = await ref.get()

          if (!snap.exists) {
            return { id, exists: false }
          }

          const data = snap.data()

          const orderedHeuristicAnswers = sortHeuristics(data.heuristicAnswers)

          // 🔥 DESCOMENTE QUANDO QUISER SALVAR
          await ref.update({
            heuristicAnswers: orderedHeuristicAnswers,
          })

          return {
            id,
            exists: true,
            before: data.heuristicAnswers,
            after: orderedHeuristicAnswers,
          }
        }),
      )

      return res.status(200).json({
        message: 'success',
        results,
      })
    } catch (error) {
      logger.error('Error:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})

export const copyTestStructureFromTestToOthers = functions.onRequest({
  handler: async (req, res) => {
    try {
      console.log('🚀 start copy testStructure')

      const db = admin.firestore()

      // 👉 ID do test que será a fonte
      const sourceTestId = 'o4AncKczEFSc505i5kTG'

      // 👉 IDs dos tests que irão receber
      const targetIds = ['t6pmV99ilaIs0dAqLQyN']

      // 🔍 pega o test origem
      const sourceRef = db.collection('tests').doc(sourceTestId)
      const sourceSnap = await sourceRef.get()

      if (!sourceSnap.exists) {
        return res.status(404).json({
          message: 'source test not found',
        })
      }

      const sourceData = sourceSnap.data()

      const testStructure = sourceData.testStructure

      if (!testStructure) {
        return res.status(400).json({
          message: 'source test has no testStructure',
        })
      }

      // 🔄 aplica nos outros documentos
      const results = await Promise.all(
        targetIds.map(async (id) => {
          const ref = db.collection('tests').doc(id)
          const snap = await ref.get()

          if (!snap.exists) {
            return { id, exists: false }
          }

          const before = snap.data().testStructure

          // 🔥 DESCOMENTE QUANDO QUISER SALVAR
          await ref.update({
            testStructure: testStructure,
          })

          return {
            id,
            exists: true,
            before,
            after: testStructure,
          }
        }),
      )

      return res.status(200).json({
        message: 'success',
        sourceTestId,
        results,
      })
    } catch (error) {
      logger.error('Error:', { error })
      return res.status(500).json({ error: error.message })
    }
  },
})
