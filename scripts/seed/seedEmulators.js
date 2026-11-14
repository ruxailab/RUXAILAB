/*
 * Fills the Firebase emulators with demo accounts, studies and answers.
 *
 *   npm run seed
 *
 * Start the emulators first. The script only talks to the emulators: it sets
 * the emulator hosts itself and refuses any project id that is not a "demo-"
 * project, which Firebase never connects to real services.
 */
import { randomBytes } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { buildSeedData, SEED_USERS } from './seedData.js'

const PROJECT_ID = process.env.SEED_PROJECT_ID || 'demo-ruxailab'

// No password is stored in the repository: each run creates one and prints
// it. Set SEED_PASSWORD to keep the same password across runs.
const PASSWORD =
  process.env.SEED_PASSWORD || randomBytes(9).toString('base64url')

// Ports match the "emulators" block of firebase.json.
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8081'
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'

const fail = (message) => {
  console.error(`\nSeed aborted: ${message}\n`)
  process.exit(1)
}

if (!PROJECT_ID.startsWith('demo-')) {
  fail(
    `"${PROJECT_ID}" is not a demo project. Seeding is only allowed for project ids that start with "demo-".`,
  )
}

async function assertEmulatorsAreRunning() {
  const targets = {
    Auth: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    Firestore: process.env.FIRESTORE_EMULATOR_HOST,
  }

  const results = await Promise.allSettled(
    Object.values(targets).map((host) =>
      fetch(`http://${host}/`, { signal: AbortSignal.timeout(3000) }),
    ),
  )

  const unreachable = Object.entries(targets).filter(
    (_, index) => results[index].status === 'rejected',
  )
  if (unreachable.length) {
    const list = unreachable
      .map(([name, host]) => `${name} (${host})`)
      .join(', ')
    fail(
      `emulator not reachable: ${list}. Start the emulators first, for example:\n  npx firebase-tools emulators:start --project ${PROJECT_ID}`,
    )
  }
}

async function upsertAccount(auth, { uid, email, username }) {
  const account = {
    email,
    password: PASSWORD,
    displayName: username,
    // Sign-in sends unverified accounts to the "verify your email" page.
    emailVerified: true,
  }

  try {
    await auth.updateUser(uid, account)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
    await auth.createUser({ uid, ...account })
  }
}

async function writeCollection(db, name, documents) {
  await Promise.all(
    Object.entries(documents).map(([id, data]) =>
      db.collection(name).doc(id).set(data),
    ),
  )
  return Object.keys(documents).length
}

async function seed() {
  await assertEmulatorsAreRunning()

  const app = initializeApp({ projectId: PROJECT_ID })
  const auth = getAuth(app)
  const db = getFirestore(app)
  const { users, studies, answers } = buildSeedData()

  await Promise.all(
    Object.values(SEED_USERS).map((account) => upsertAccount(auth, account)),
  )

  // Users first: the study triggers read the owner's user document.
  const userCount = await writeCollection(db, 'users', users)
  const answerCount = await writeCollection(db, 'answers', answers)
  const studyCount = await writeCollection(db, 'tests', studies)

  console.log(`
Seeded project "${PROJECT_ID}":
  ${userCount} accounts, ${studyCount} studies, ${answerCount} answer documents

Sign in with (password for both: ${PASSWORD})
  ${SEED_USERS.researcher.email}   owns the demo studies
  ${SEED_USERS.participant.email}  can answer them

Studies
${Object.entries(studies)
  .map(([id, study]) => `  ${study.testTitle}  (id: ${id})`)
  .join('\n')}
`)
}

try {
  await seed()
} catch (error) {
  fail(error.message || String(error))
}
