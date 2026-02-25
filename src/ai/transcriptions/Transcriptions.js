/** @typedef {Object} Timestamp - Firebase Timestamp object */

/**
 * Create a transcription Object for Moderated Test Task
 * @param {string} [id=null] - The unique ID of the document (optional).
 * 
 * @param {string} answersDocId - The answer document ID related to the transcription.
 * @param {string} userDocId - The user document ID related to the transcription.
 * @param {string} taskId - The task ID related to the transcription.
 * 
 * @param {string} provider - The provider of the transcription service.
 * @param {string} model - The model from the provider used for transcription.
 * @param {Timestamp} createdAt - The timestamp when the transcription was created.
 * 
 * @param {Object} moderator - An object containing the transcription for moderator's Audio.
 * @param {string} moderator.language - The language of the transcription.
 * @param {string} moderator.transcript - The transcript of the moderator's audio.
 * @param {Object[]} moderator.segments - Th e segments of the transcription of the moderator's audio.
 * @param {number} moderator.segments[].start - The start time of the segment (in seconds).
 * @param {number} moderator.segments[].end - The end time of the segment (in seconds).
 * @param {string} moderator.segments[].text - The text of the segment.
 * 
 * 
 * @param {Object} evaluator - An object containing the transcripeion for Evaluator's Audio.
 * @param {string} evaluator.language - The language of the transcription.
 * @param {string} evaluator.transcript - The transcript of the evaluator's audio.
 * @param {Object[]} evaluator.segments - The segments of the transcription of the Evaluator's audio.
 * @param {number} evaluator.segments[].start - The start time of the segment (in seconds).
 * @param {number} evaluator.segments[].end - The end time of the segment (in seconds).
 * @param {string} evaluator.segments[].text - The text of the segment.
 */


export default class Transcription {
    /**
     * Constructs an instance of Transcription.
     * @param {Object} params - The parameters for the Transcription instance.
     * @param {string} [params.id=null] - The unique ID of the document (optional).
     * @param {string} params.answersDocId - The Answer document ID.
     * @param {string} params.userDocId - The User document ID.
     * @param {string} params.taskId - The Task document ID.
     * 
     * @param {string} params.provider - The provider of the transcription service.
     * @param {string} params.model - The model from the provider used for transcription.
     * @param {Timestamp} params.createdAt - The timestamp when the transcription was created.
     * 
     * @param {Object} params.moderator - An object containing the transcription for moderator's Audio.
     * @param {string} params.moderator.language - The language of the transcription.
     * @param {string} params.moderator.transcript - The transcript of the moderator's audio.
     * @param {Object[]} params.moderator.segments - The segments of the transcription of the moderator's audio.
     * @param {number} params.moderator.segments[].start - The start time of the segment (in seconds).
     * @param {number} params.moderator.segments[].end - The end time of the segment (in seconds).
     * @param {string} params.moderator.segments[].text - The text of the segment.
     * 
     * 
     * @param {Object} params.evaluator - An object containing the transcripeion for Evaluator's Audio.
     * @param {string} params.evaluator.language - The language of the transcription.
     * @param {string} params.evaluator.transcript - The transcript of the evaluator's audio.
     * @param {Object[]} params.evaluator.segments - The segments of the transcription of the Evaluator's audio.
     * @param {number} params.evaluator.segments[].start - The start time of the segment (in seconds).
     * @param {number} params.evaluator.segments[].end - The end time of the segment (in seconds).
     * @param {string} params.evaluator.segments[].text - The text of the segment.
     */
    constructor({ id = null, answersDocId, userDocId, taskId, provider, model, createdAt, moderator, evaluator } = {}) {

        /**
         * The unique ID of the document (optional)
         * @type {string|null}
         */
        this.id = id;


        /**
         * The Answer document ID
         * @type {string}
         */
        this.answersDocId = answersDocId;

        /**
         * The User document ID
         * @type {string}
         */
        this.userDocId = userDocId;

        /**
         * The Task document ID
         * @type {string}
         */
        this.taskId = taskId;

        /**
         * The provider of the transcription service.
         * @type {string}
         */
        this.provider = provider;

        /**
         * The model from the provider used for transcription.
         * @type {string}
         */
        this.model = model;

        /**
         * The timestamp when the transcription was created.
         * @type {Timestamp}
         */
        this.createdAt = createdAt;

        /**
         * An object containing the transcription for moderator's Audio.
         * @type {Object}
         */
        this.moderator = moderator;

        /**
         * An object containing the transcription for Evaluator's Audio.
         * @type {Object}
         */
        this.evaluator = evaluator;

    }

    /**
    * Creates a new Transcription instance from a plain object (e.g., from Firestore).
    * Converts a plain object (often from a database or API response) into an instance of Transcription.
    *
    * @param {Object} data - The plain object to convert.
    * @param {string} data.id - The unique ID of the document.
    * @param {string} data.answersDocId - The Answer document ID.
    * @param {string} data.userDocId - The User document ID.
    * @param {string} data.taskId - The Task document ID.
    * 
    * @param {string} data.provider - The provider of the transcription service.
    * @param {string} data.model - The model from the provider used for transcription.
    * @param {Timestamp} data.createdAt - The timestamp when the transcription was created.
    * 
    * @param {Object} data.moderator - An object containing the transcription for moderator's Audio.
    * @param {string} data.moderator.language - The language of the transcription.
    * @param {string} data.moderator.transcript - The transcript of the moderator's audio.
    * @param {Object[]} data.moderator.segments - The segments of the transcription of the moderator's audio.
    * @param {number} data.moderator.segments[].startTimeSec - The start time of the segment (in seconds).
    * @param {number} data.moderator.segments[].endTimeSec - The end time of the segment (in seconds).
    * @param {string} data.moderator.segments[].text - The text of the segment.
    *
    * @param {Object} data.evaluator - An object containing the transcription for Evaluator's Audio.
    * @param {string} data.evaluator.language - The language of the transcription.
    * @param {string} data.evaluator.transcript - The transcript of the evaluator's audio.
    * @param {Object[]} data.evaluator.segments - The segments of the transcription of the Evaluator's audio.
    * @param {number} data.evaluator.segments[].startTimeSec - The start time of the segment (in seconds).
    * @param {number} data.evaluator.segments[].endTimeSec - The end time of the segment (in seconds).
    * @param {string} data.evaluator.segments[].text - The text of the segment.
    *
    * @returns {Transcription} The created Transcription instance.
    */
    static toTranscription(data) {
        return new Transcription({
            id: data.id,
            answersDocId: data.answersDocId,
            userDocId: data.userDocId,
            taskId: data.taskId,
            provider: data.provider,
            model: data.model,
            createdAt: data.createdAt,
            moderator: {
                language: data.moderator.language,
                transcript: data.moderator.transcript,
                segments: data.moderator.segments.map(segment => ({
                    start: segment.startTimeSec,
                    end: segment.endTimeSec,
                    text: segment.text
                }))
            },
            evaluator: {
                language: data.evaluator.language,
                transcript: data.evaluator.transcript,
                segments: data.evaluator.segments.map(segment => ({
                    start: segment.startTimeSec,
                    end: segment.endTimeSec,
                    text: segment.text
                }))
            }
        });
    }

    /**
     * Converts the Transcription instance to a format suitable for Firestore.
     * 
     * @returns {Object} - The object representation of the Transcription instance.
     * @returns {string} - The Answer document ID.
     * @returns {string} - The User document ID.
     * @returns {string} - The Task document ID.
     * 
     * @returns {string} - The provider of the transcription service.
     * @returns {string} - The model from the provider used for transcription.
     * @returns {Timestamp} - The timestamp when the transcription was created.
     * 
     * @param {Object} - An object containing the transcription for moderator's Audio.
     * @param {string} - The language of the transcription.
     * @param {string} - The transcript of the moderator's audio.
     * @param {Object[]} - The segments of the transcription of the moderator's audio.
     * @param {number} - The start time of the segment (in seconds).
     * @param {number} - The end time of the segment (in seconds).
     * @param {string} - The text of the segment.
     * 
     * @param {Object} - An object containing the transcription for Evaluator's Audio.
     * @param {string} - The language of the transcription.
     * @param {string} - The transcript of the evaluator's audio.
     * @param {Object[]} - The segments of the transcription of the evaluator's audio.
     * @param {number} - The start time of the segment (in seconds).
     * @param {number} - The end time of the segment (in seconds).
     * @param {string} - The text of the segment.
     */
    toFirestore() {
        return {
            answersDocId: this.answersDocId,
            userDocId: this.userDocId,
            taskId: this.taskId,
            provider: this.provider,
            model: this.model,
            createdAt: this.createdAt,
            moderator: {
                language: this.moderator.language,
                transcript: this.moderator.transcript,
                segments: this.moderator.segments.map(segment => ({
                    startTimeSec: segment.start,
                    endTimeSec: segment.end,
                    text: segment.text
                }))
            },
            evaluator: {
                language: this.evaluator.language,
                transcript: this.evaluator.transcript,
                segments: this.evaluator.segments.map(segment => ({
                    startTimeSec: segment.start,
                    endTimeSec: segment.end,
                    text: segment.text
                }))
            }
        };
    }
};
