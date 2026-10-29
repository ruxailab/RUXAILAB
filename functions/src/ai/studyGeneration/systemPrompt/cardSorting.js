/**
 * CARD_SORTING method prompt fragment.
 */

export const METHOD_KEY = 'CARD_SORTING'

/**
 * @returns {string}
 */
export function buildCardSortingPrompt() {
  return `CARD_SORTING:
- subType: "CARD_SORTING"
- testStructure MUST be an OBJECT (never null, never a string) with:
  welcomeMessage, finalMessage, consent, preTest=[], postTest=[], cardSorting
- cardSorting.cards: [{ "title": "...", "description": "" }] — include EVERY card the user listed
- cardSorting.categories: [{ "title": "...", "description": "" }]
- cardSorting.options:
  - allow_create_categories: true when the user can create categories ("possa criar", open/hybrid); false for closed
- Modes:
  - closed: allow_create_categories=false AND categories length >= 1
  - open: allow_create_categories=true AND categories=[]
  - hybrid: allow_create_categories=true AND categories length >= 1
- Example shape (hybrid):
{
  "testType": "CARD_SORTING",
  "subType": "CARD_SORTING",
  "testTitle": "Test Build LLM",
  "testDescription": "Card sorting study",
  "isPublic": false,
  "status": "active",
  "testOptions": [],
  "testStructure": {
    "welcomeMessage": "Welcome",
    "finalMessage": "Thanks",
    "consent": "",
    "preTest": [],
    "postTest": [],
    "cardSorting": {
      "cards": [
        { "title": "TV", "description": "" },
        { "title": "Pia", "description": "" },
        { "title": "Fogão", "description": "" }
      ],
      "categories": [{ "title": "Sala", "description": "" }],
      "options": {
        "card_description": false,
        "card_image": false,
        "category_description": false,
        "category_image": false,
        "allow_create_categories": true
      }
    }
  },
  "clarificationNeeded": false,
  "clarificationQuestions": []
}`
}
