// Data Model: AudioSentiment
import AudioSentiment from '@/models/AudioSentiment';

import Controller from '@/controllers/BaseController'

const COLLECTION = 'audioSentiment'

export default class AudioSentimentController extends Controller {
    constructor() {
        super()
    }

    async create(payload) {

        const audioSentiment = new AudioSentiment({
            answerDocId: payload.answerDocId,
            userDocId: payload.userDocId,
            regions: [],
        }).toFirestore()

        try {
            // Check if the document already exists
            const conditions = [
                { field: 'answerDocId', condition: '==', value: payload.answerDocId },
                { field: 'userDocId', condition: '==', value: payload.userDocId }
            ]
            const result = await super.queryWithMultipleConditions(COLLECTION, conditions);
            if (result.docs.length > 0) {
                // Throw an error if the document already exists
                throw new Error(`Document with answerDocId ${payload.answerDocId} and userDocId ${payload.userDocId} already exists.`);
            }
            else {
                // Document does not exist, create it
                return await super.create(COLLECTION, audioSentiment);
            }
        } catch (error) {
            // Re-throw the error to be caught by the calling code
            throw new Error(`Error creating document: ${error.message}`);
        }
    }

    async getByAnswerDocIdandUserDocId(answerDocId, userDocId) {
        const conditions = [
            { field: 'answerDocId', condition: '==', value: answerDocId },
            { field: 'userDocId', condition: '==', value: userDocId }
        ]
        const result = await super.queryWithMultipleConditions(COLLECTION, conditions);

        if (result.docs.length == 0) return null;
        return AudioSentiment.toAudioSentiment(result.docs[0].data());
    }
}
