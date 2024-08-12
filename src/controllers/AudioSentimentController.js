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

    async getById(docId) {
        const res = await super.readOne(COLLECTION, docId)
        return new AudioSentiment({ ...res.data() })

        // This code isn't used bec
        // return new AudioSentiment({ id: res.id, ...res.data() })
    }

    /**
     * Add a new region sentiment to an existing AudioSentiment document.
     * @param {string} docId - The ID of the AudioSentiment document to update.
     * @param {Object} payload - The sentiment data to add to the regions array.
     * @param {number} payload.start - The start time of the sentiment region (in seconds).
     * @param {number} payload.end - The end time of the sentiment region (in seconds).
     * @param {string} payload.transcript - The transcript of the sentiment region.
     * @param {string} payload.sentiment - The sentiment expressed in this region.
     * @param {number} payload.confidence - The sentiment confidence for the region.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the document is not found or if an update fails.
     */
    async addRegionSentiment(docId, payload) {
        try {

            // Retrieve the existing document
            const docSnapshot = await super.readOne(COLLECTION, docId);

            if (!docSnapshot.exists()) {
                throw new Error(`Document with ID ${docId} not found.`);
            }


            const audioSentiment = new AudioSentiment({ ...docSnapshot.data() })

            console.log("audioSentiment",payload)


            // Add the new region sentiment to the regions array
            audioSentiment.regions.push(payload)
            console.log("audioSentiment",audioSentiment)

            console.log('audioSentiment', audioSentiment.toFirestore())
            // return null

            // Update the document with the new region sentiment
            return await super.update(COLLECTION, docId, audioSentiment.toFirestore());

        }
        catch (error) {
            // Re-throw the error to be caught by the calling code
            throw new Error(`Error adding region sentiment: ${error.message}`);
        }
    }
}