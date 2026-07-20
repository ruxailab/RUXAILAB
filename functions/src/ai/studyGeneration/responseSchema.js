/**
 * OpenAI / OpenRouter JSON Schema for study draft generation.
 * Pragmatic object shape with optional method blocks; server validates by testType.
 */
export const studyDraftJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    testType: {
      type: 'string',
      enum: ['CARD_SORTING', 'USER', 'HEURISTIC', 'FOCUS_GROUP'],
    },
    subType: {
      type: ['string', 'null'],
    },
    testTitle: { type: 'string' },
    testDescription: { type: 'string' },
    isPublic: { type: 'boolean' },
    status: {
      type: 'string',
      enum: ['active', 'draft'],
    },
    testOptions: {
      type: 'array',
      items: { type: 'object', additionalProperties: true },
    },
    testStructure: {
      type: ['object', 'null'],
      additionalProperties: false,
      properties: {
        welcomeMessage: { type: 'string' },
        finalMessage: { type: 'string' },
        consent: { type: 'string' },
        preTest: {
          type: 'array',
          items: { type: 'object', additionalProperties: true },
        },
        postTest: {
          type: 'array',
          items: { type: 'object', additionalProperties: true },
        },
        cardSorting: {
          type: ['object', 'null'],
          additionalProperties: false,
          properties: {
            cards: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
                required: ['title'],
              },
            },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
                required: ['title'],
              },
            },
            options: {
              type: 'object',
              additionalProperties: false,
              properties: {
                card_description: { type: 'boolean' },
                card_image: { type: 'boolean' },
                category_description: { type: 'boolean' },
                category_image: { type: 'boolean' },
                allow_create_categories: { type: 'boolean' },
                hasScreenRecord: { type: 'boolean' },
                hasCamRecord: { type: 'boolean' },
                hasAudioRecord: { type: 'boolean' },
              },
            },
          },
        },
        userTasks: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              taskName: { type: 'string' },
              taskDescription: { type: 'string' },
              taskTip: { type: 'string' },
              taskLink: { type: 'string' },
              hasAudioRecord: { type: 'boolean' },
              hasScreenRecord: { type: 'boolean' },
              hasCamRecord: { type: 'boolean' },
              hasEye: { type: 'boolean' },
            },
            required: ['taskName', 'taskDescription'],
          },
        },
        heuristics: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'number' },
                    title: { type: 'string' },
                    descriptions: { type: 'array', items: { type: 'string' } },
                    comparison: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['title'],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      },
    },
    discussionGuide: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          prompts: { type: 'array', items: { type: 'string' } },
          durationMinutes: { type: 'integer' },
        },
        required: ['id', 'title', 'prompts', 'durationMinutes'],
      },
    },
    config: {
      type: 'object',
      additionalProperties: false,
      properties: {
        enableWaitingRoom: { type: 'boolean' },
        requireConsent: { type: 'boolean' },
        hideObservers: { type: 'boolean' },
        maxParticipants: { type: 'integer' },
      },
    },
    useWeights: { type: 'boolean' },
    useSeverity: { type: 'boolean' },
    useFrequency: { type: 'boolean' },
    trackTime: { type: 'boolean' },
    clarificationNeeded: { type: 'boolean' },
    clarificationQuestions: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: [
    'testType',
    'testTitle',
    'testDescription',
    'clarificationNeeded',
    'clarificationQuestions',
  ],
}

/** @deprecated Use studyDraftJsonSchema */
export const studyDraftResponseSchema = studyDraftJsonSchema
