/**
 * HEURISTIC method prompt fragment.
 */

export const METHOD_KEY = 'HEURISTIC'

/**
 * @returns {string}
 */
export function buildHeuristicPrompt() {
  return `HEURISTIC:
- subType: null
- Because the JSON schema types testStructure as an object, put heuristics under testStructure.heuristics as an ARRAY of { id, title, questions: [{ id, title, descriptions, comparison }] }
- The server will normalize heuristics into the Firestore array shape.
- Also set useWeights, useSeverity, useFrequency, trackTime when relevant`
}
