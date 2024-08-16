/**
 * Create an Audio Sentiment Object for Unmoderated Test (Evaluator Side).
 * @param {string} answerDocId - The document ID related to the audio answer.
 * @param {Object[]} regions - An array of sentiment regions in the audio.
 * @param {number} regions[].start - The start time of the sentiment region (in seconds).
 * @param {number} regions[].end - The end time of the sentiment region (in seconds).
 * @param {string} regions[].transcipt - The transcipt of the sentiment region.
 * @param {string} regions[].sentiment - The sentiment expressed in this region.
 * @param {number} regions[].confidence - The sentiment confidence for the region.
 */

export default class AudioSentiment {
    /**
     * Constructs an instance of AudioSentiment.
     * @param {string} answerDocId - The Answer document ID.
     * @param {string} userDocId - The User document ID.
     * @param {Object[]} regions - An array of sentiment regions in the audio.
     */
    constructor({ answerDocId, userDocId, regions } = {}) {

        /**
         * The Answer document ID
         * @type {string}
         */
        this.answerDocId = answerDocId;

        /**
         * The User document ID
         * @type {string}
         */
        this.userDocId = userDocId;

        /**
         * An array of sentiment regions in the audio.
         * @type {Object[]}
         */
        this.regions = regions;
    }


    /**
     * Creates a new AudioSentiment instance from a plain object (e.g., from Firestore).
     * It Converts a plain object (often from a database or API response) into an instance of AudioSentiment.
     * @param {Object} data - The raw data to convert into an AudioSentiment instance.
     * @returns {AudioSentiment} - The newly created AudioSentiment instance.
     */
    static toAudioSentiment(data) {
        return new AudioSentiment({
            answerDocId: data.answerDocId,
            userDocId: data.userDocId,
            regions: data.regions.map(region => ({
                start: region.start,
                end: region.end,
                transcipt: region.transcipt,
                sentiment: region.sentiment,
                confidence: region.confidence // Directly including the confidence
            }))
        });
    }


    /**
     * Converts the AudioSentiment instance to a format suitable for Firestore.
     * @returns {Object} - The object representation of the AudioSentiment instance.
     */
    toFirestore() {
        return {
            answerDocId: this.answerDocId,
            userDocId: this.userDocId,
            regions: this.regions.map(region => ({
                start: region.start,
                end: region.end,
                transcript: region.transcript,
                sentiment: region.sentiment,
                confidence: region.confidence // Directly including the confidence
            }))
        };
    }
};