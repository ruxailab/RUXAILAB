import Controller from "@/app/plugins/firebase/FirebaseFirestoreRepository";
import { deleteField } from "firebase/firestore";
import { STUDY_TYPES } from "../constants/methodDefinitions";

const firestoreService = new Controller();

export default class ReportController {
    /**
     * Remove o report de um usuário e do documento de respostas.
     *
     * @param {Object} params
     * @param {Object} params.report - O report a ser removido.
     * @param {Object} params.test - O objeto do teste atual.
     */
    async removeReport({ report, test }) {
        const answerId = test.answersDocId;
        const userToRemoveId = report.userDocId;
        let testType = test.testType;
        const testId = test.id;

        if (testType === STUDY_TYPES.HEURISTIC) testType = "heuristicAnswers";
        if (testType === STUDY_TYPES.USER) testType = "taskAnswers";

        try {
            // 1 - Remover a referência no usuário
            const userDoc = await firestoreService.readOne("users", userToRemoveId);
            if (userDoc.exists()) {
                await firestoreService.update("users", userToRemoveId, {
                    [`myAnswers.${testId}`]: deleteField(),
                });
            }

            // 2 - Remover a referência no documento de respostas
            const answerDoc = await firestoreService.readOne("answers", answerId);
            if (answerDoc.exists()) {
                await firestoreService.update("answers", answerId, {
                    [`${testType}.${userToRemoveId}`]: deleteField(),
                });
            }

            return { success: true };
        } catch (e) {
            console.error("RemoveReportError", e);
            return { success: false, error: e };
        }
    }
}
