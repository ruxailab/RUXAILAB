/*
 * Demo data for the Firebase emulators.
 *
 * Every document mirrors what the app writes through its own models
 * (`toFirestore()`), and `tests/unit/seedData.spec.js` runs this data back
 * through those models, so a model change that breaks the seed fails a test.
 *
 * Ids are fixed, so seeding twice overwrites the same documents instead of
 * adding duplicates.
 */

export const SEED_USERS = {
  researcher: {
    uid: 'seed-researcher',
    email: 'researcher@ruxailab.test',
    username: 'Demo Researcher',
  },
  participant: {
    uid: 'seed-participant',
    email: 'participant@ruxailab.test',
    username: 'Demo Participant',
  },
}

const DAY = 24 * 60 * 60 * 1000

const userDocument = ({ email, username }, myTests = {}) => ({
  accessLevel: 1,
  email,
  myAnswers: {},
  myTests,
  username,
  contactNo: null,
  country: '',
  profileImage: '',
  lastCalibrationId: null,
  storageUsageMB: 0,
})

// Fields shared by every study type (see shared/models/Study.js).
const baseStudy = ({
  title,
  description,
  testType,
  subType,
  testStructure,
  answersDocId,
  createdAt,
}) => ({
  testTitle: title,
  testDescription: description,
  testAdmin: {
    email: SEED_USERS.researcher.email,
    userDocId: SEED_USERS.researcher.uid,
  },
  testType,
  testStructure,
  testOptions: [],
  answersDocId,
  cooperators: [],
  creationDate: createdAt,
  updateDate: createdAt,
  templateDoc: null,
  // Public, so the demo participant can open the study without an invitation.
  isPublic: true,
  studyConclusion: null,
  status: 'active',
  endDate: null,
  subType,
  studyRoleMap: {},
})

const task = (overrides) => ({
  taskName: '',
  taskDescription: '',
  taskTip: '',
  taskLink: 'https://example.com',
  taskType: 'no-answer',
  hasAudioRecord: false,
  hasScreenRecord: false,
  hasCamRecord: false,
  hasEye: false,
  estimatedTime: 2,
  ...overrides,
})

const userStudy = (createdAt) => ({
  ...baseStudy({
    title: 'Demo: Checkout usability',
    description:
      'Unmoderated user study with a written task and a System Usability Scale (SUS) questionnaire.',
    testType: 'USER',
    subType: 'USER_UNMODERATED',
    answersDocId: 'seed-user-study-answers',
    createdAt,
    testStructure: {
      welcomeMessage: 'Thanks for helping us test the checkout.',
      finalMessage: 'That is all. Thank you for taking part!',
      consent: '',
      preTest: [],
      postTest: [],
      userTasks: [
        task({
          taskName: 'Find the checkout',
          taskDescription:
            'Add any product to the cart and describe how you reached the checkout page.',
          taskType: 'text-area',
        }),
        task({
          taskName: 'Rate the experience',
          taskDescription:
            'Answer the System Usability Scale (SUS) questionnaire about the checkout.',
          taskType: 'sus',
        }),
      ],
    },
  }),
  calibrationConfig: null,
  allowMobileTaskInstructions: true,
})

const heuristicStudy = (createdAt) => ({
  ...baseStudy({
    title: 'Demo: Heuristic evaluation',
    description:
      'Heuristic evaluation with two heuristics, ready to be answered.',
    testType: 'HEURISTIC',
    subType: 'QUANTITATIVE',
    answersDocId: 'seed-heuristic-study-answers',
    createdAt,
    testStructure: [
      {
        id: 0,
        title: 'Visibility of system status',
        questions: [
          {
            id: 0,
            title: 'Does the system show what it is doing?',
            descriptions: [],
            comparison: [],
          },
          {
            id: 1,
            title: 'Is feedback given within a reasonable time?',
            descriptions: [],
            comparison: [],
          },
        ],
      },
      {
        id: 1,
        title: 'Error prevention',
        questions: [
          {
            id: 0,
            title: 'Are risky actions confirmed before they run?',
            descriptions: [],
            comparison: [],
          },
          {
            id: 1,
            title: 'Are invalid inputs caught before submitting?',
            descriptions: [],
            comparison: [],
          },
        ],
      },
    ],
  }),
  testWeights: {},
  trackTime: true,
  studyMode: null,
  useWeights: false,
  useFrequency: true,
  useSeverity: true,
  evaluatorInfo: { enabled: false, sections: [] },
  heuristicComments: {},
  heuristicAgentWebsites: { url: '', pages: [], selectedUrls: [] },
  heuristicAgentIds: [],
})

// A submitted answer to the user study. `susAnswers` holds the ten SUS items.
const userStudyAnswer = ({
  userDocId,
  fullName,
  answer,
  susAnswers,
  taskSeconds,
  submittedAt,
}) => ({
  preTestAnswer: [],
  consent: '',
  postTestAnswer: [],
  preTestCompleted: true,
  consentCompleted: true,
  fullName,
  postTestCompleted: true,
  tasks: {
    0: {
      taskId: 0,
      taskAnswer: answer,
      taskTime: taskSeconds,
      completed: true,
      attempted: true,
      susAnswers: [],
    },
    1: {
      taskId: 1,
      taskAnswer: '',
      taskTime: 60,
      completed: true,
      attempted: true,
      susAnswers,
    },
  },
  progress: 100,
  total: 2,
  totalTestTimeMs: (taskSeconds + 60) * 1000,
  submitted: true,
  userDocId,
  lastUpdate: submittedAt,
  invited: false,
  hidden: false,
  sessionNotes: [],
})

const myTestsEntry = (id, study) => ({
  testDocId: id,
  testTitle: study.testTitle,
  testType: study.testType,
  subType: study.subType,
  numberColaborators: 0,
  creationDate: study.creationDate,
  updateDate: study.updateDate,
})

/**
 * Builds every document the seed writes.
 * @param {number} [now] - Reference time in epoch milliseconds.
 */
export function buildSeedData(now = Date.now()) {
  const studies = {
    'seed-user-study': userStudy(now - 7 * DAY),
    'seed-heuristic-study': heuristicStudy(now - 3 * DAY),
  }

  const answers = {
    'seed-user-study-answers': {
      type: 'USER',
      studyId: 'seed-user-study',
      createdBy: SEED_USERS.researcher.uid,
      taskAnswers: {
        'seed-answer-ana': userStudyAnswer({
          userDocId: 'seed-answer-ana',
          fullName: 'Ana Souza',
          answer: 'I used the cart icon in the header. It was easy to find.',
          susAnswers: [5, 1, 5, 1, 5, 1, 5, 2, 5, 3],
          taskSeconds: 75,
          submittedAt: now - 5 * DAY,
        }),
        'seed-answer-ben': userStudyAnswer({
          userDocId: 'seed-answer-ben',
          fullName: 'Ben Carter',
          answer:
            'I had to scroll to the bottom of the page to see the button.',
          susAnswers: [4, 2, 4, 2, 4, 3, 4, 2, 3, 2],
          taskSeconds: 130,
          submittedAt: now - 4 * DAY,
        }),
        'seed-answer-chen': userStudyAnswer({
          userDocId: 'seed-answer-chen',
          fullName: 'Chen Li',
          answer: 'I could not tell which button continued to payment.',
          susAnswers: [3, 3, 2, 4, 3, 3, 2, 4, 3, 4],
          taskSeconds: 210,
          submittedAt: now - 2 * DAY,
        }),
      },
    },
    'seed-heuristic-study-answers': {
      type: 'HEURISTIC',
      studyId: 'seed-heuristic-study',
      createdBy: SEED_USERS.researcher.uid,
      heuristicAnswers: {},
    },
  }

  const myTests = Object.fromEntries(
    Object.entries(studies).map(([id, study]) => [id, myTestsEntry(id, study)]),
  )

  const users = {
    [SEED_USERS.researcher.uid]: userDocument(SEED_USERS.researcher, myTests),
    [SEED_USERS.participant.uid]: userDocument(SEED_USERS.participant),
  }

  return { users, studies, answers }
}
