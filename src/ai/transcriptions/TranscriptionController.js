// Data Model: Transcription
import Transcription from '@/ai/transcriptions/Transcriptions';

import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'

const COLLECTION = 'transcriptions'


/**
 * Controller for managing Transcription documents in Firestore.
 * 
 * This class provides methods for creating, retrieving, and updating Transcription documents,
 * which store transcription data related to moderated test tasks.
 * 
 * @extends Controller
 */
export default class TranscriptionController extends Controller {
    /**
     * Constructs an instance of TranscriptionController.
     * 
     * Calls the parent class constructor to initialize any inherited properties or methods.
     */
    constructor() {
        super()
    }

    // TODO: create

    /**
     * Retrieves a Transcription document from Firestore by its document ID.
     * 
     * @param {string} id - The unique ID of the Transcription document to retrieve.
     * @returns {Promise<Transcription|null>} - Returns a Promise that resolves to an instance of Transcription if the document exists, or null if it does not.
     * @throws {Error} - Throws an error if there is an issue retrieving the document from Firestore.
     */
    async getById(id) {
        const doc = await super.readOne(COLLECTION, id);

        if (!doc.exists()) {
            return null;
        }

        return Transcription.toTranscription({
            id: doc.id, // Include the document ID here
            ...doc.data()
        });

    }

    //TODO: getByAnswerDocIdandUserDocIdandTaskId

}