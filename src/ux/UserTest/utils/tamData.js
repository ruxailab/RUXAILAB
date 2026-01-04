// TAM Questionnaire Items and Scale Definitions

export const TAM_SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Somewhat Disagree' },
  { value: 4, label: 'Neither Agree nor Disagree' },
  { value: 5, label: 'Somewhat Agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly Agree' },
]

// TAM-1 Items (Original Davis 1989)
export const TAM1_ITEMS = {
  perceivedUsefulness: [
    'Using [this system] in my job would enable me to accomplish tasks more quickly.',
    'Using [this system] would improve my job performance.',
    'Using [this system] in my job would increase my productivity.',
    'Using [this system] would enhance my effectiveness on the job.',
    'Using [this system] would make it easier to do my job.',
    'I would find [this system] useful in my job.',
  ],
  perceivedEaseOfUse: [
    'Learning to operate [this system] would be easy for me.',
    'I would find it easy to get [this system] to do what I want it to do.',
    'My interaction with [this system] would be clear and understandable.',
    'I would find [this system] to be flexible to interact with.',
    'It would be easy for me to become skillful at using [this system].',
    'I would find [this system] easy to use.',
  ],
}

// TAM-2 Additional Items
export const TAM2_ADDITIONAL_ITEMS = {
  subjectiveNorm: [
    'People who influence my behavior think that I should use [this system].',
    'People who are important to me think that I should use [this system].',
    'The senior management of this business has been helpful in the use of [this system].',
    'In general, the organization has supported the use of [this system].',
  ],
  image: [
    'People in my organization who use [this system] have more prestige than those who do not.',
    'People in my organization who use [this system] have a high profile.',
    'Having [this system] is a status symbol in my organization.',
  ],
  jobRelevance: [
    'In my job, usage of [this system] is important.',
    'In my job, usage of [this system] is relevant.',
  ],
  outputQuality: [
    'The quality of the output I get from [this system] is high.',
    "I have no problem with the quality of [this system]'s output.",
  ],
  resultDemonstrability: [
    'I have no difficulty telling others about the results of using [this system].',
    'I believe I could communicate to others the consequences of using [this system].',
    'The results of using [this system] are apparent to me.',
    'I would have difficulty explaining why using [this system] may or may not be beneficial.', // Reverse coded
  ],
}

// TAM-3 Additional Items
export const TAM3_ADDITIONAL_ITEMS = {
  computerSelfEfficacy: [
    'I could complete a job or task using [this system] if there was no one around to tell me what to do as I go.',
    'I could complete a job or task using [this system] if I could call someone for help if I got stuck.',
    'I could complete a job or task using [this system] if I had a lot of time to complete the job for which the software was provided.',
    'I could complete a job or task using [this system] if I had just the built-in help facility for assistance.',
    'I could complete a job or task using [this system] if someone else had helped me get started.',
    'I could complete a job or task using [this system] if I had used similar systems before this one to do the same job.',
    'I could complete a job or task using [this system] if someone showed me how to do it first.',
    'I could complete a job or task using [this system] if I had never used a system like it before.',
    'I could complete a job or task using [this system] if I had only the system manuals for reference.',
    'I could complete a job or task using [this system] if I had seen someone else using it before trying it myself.',
  ],
  perceptionOfExternalControl: [
    'I have control over using [this system].',
    'I have the resources necessary to use [this system].',
    'I have the knowledge necessary to use [this system].',
    '[This system] is not compatible with other systems I use.', // Reverse coded
  ],
  computerAnxiety: [
    'I feel apprehensive about using [this system].',
    'It scares me to think that I could lose a lot of information using [this system] by hitting the wrong key.',
    'I hesitate to use [this system] for fear of making mistakes I cannot correct.',
    '[This system] is somewhat intimidating to me.',
  ],
  computerPlayfulness: [
    'When using [this system], I am spontaneous.',
    'When using [this system], I am playful.',
    'When using [this system], I am creative.',
    'When using [this system], I am original.',
    'When using [this system], I am inventive.',
    'When using [this system], I am imaginative.',
    'When using [this system], I am flexible.',
  ],
  perceivedEnjoyment: [
    'I find using [this system] to be enjoyable.',
    'The actual process of using [this system] is pleasant.',
    'I have fun using [this system].',
    'Using [this system] provides me with a lot of enjoyment.',
  ],
  objectiveUsability: [
    '[This system] often behaves in unexpected ways.', // Reverse coded
    '[This system] makes it easy to recover from errors.',
  ],
}

// Combined items for each TAM version
export const TAM1_ALL_ITEMS = {
  ...TAM1_ITEMS,
}

export const TAM2_ALL_ITEMS = {
  ...TAM1_ITEMS,
  ...TAM2_ADDITIONAL_ITEMS,
}

export const TAM3_ALL_ITEMS = {
  ...TAM1_ITEMS,
  ...TAM2_ADDITIONAL_ITEMS,
  ...TAM3_ADDITIONAL_ITEMS,
}

// Reverse coded items mapping (item indices that need reverse scoring)
export const REVERSE_CODED_ITEMS = {
  'tam-1': {},
  'tam-2': {
    resultDemonstrability: [3], // 4th item (0-indexed)
  },
  'tam-3': {
    resultDemonstrability: [3], // 4th item (0-indexed)
    perceptionOfExternalControl: [3], // 4th item (0-indexed)
    objectiveUsability: [0], // 1st item (0-indexed)
  },
}

// Construct labels for display
export const CONSTRUCT_LABELS = {
  perceivedUsefulness: 'Perceived Usefulness',
  perceivedEaseOfUse: 'Perceived Ease of Use',
  subjectiveNorm: 'Subjective Norm',
  image: 'Image',
  jobRelevance: 'Job Relevance',
  outputQuality: 'Output Quality',
  resultDemonstrability: 'Result Demonstrability',
  computerSelfEfficacy: 'Computer Self-Efficacy',
  perceptionOfExternalControl: 'Perception of External Control',
  computerAnxiety: 'Computer Anxiety',
  computerPlayfulness: 'Computer Playfulness',
  perceivedEnjoyment: 'Perceived Enjoyment',
  objectiveUsability: 'Objective Usability',
}
