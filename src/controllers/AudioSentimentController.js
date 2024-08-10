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
            regions: [],
        }).toFirestore()

        try {
            // Check if the document already exists
            const existingDoc = await super.readOne(COLLECTION, payload.answerDocId);

            if (existingDoc.exists()) {
                // Throw an error if the document already exists
                throw new Error(`Document with ID ${payload.answerDocId} already exists.`);
            } else {
                // Document does not exist, create it
                return await super.set(COLLECTION, payload.answerDocId, audioSentiment);
            }
        } catch (error) {
            // Re-throw the error to be caught by the calling code
            throw new Error(`Error creating document: ${error.message}`);
        }
    }

    async getAudioSentimentById(payload) {
        const res = await super.readOne(COLLECTION, payload)
        return new AudioSentiment({ id: res.id, ...res.data() })
    }
}