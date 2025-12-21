import '@testing-library/jest-dom'

jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(),
  }
})

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    connectAuthEmulator: jest.fn(),
  }
})

jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(),
    connectFirestoreEmulator: jest.fn(),
  }
})

jest.mock('firebase/storage', () => {
  return {
    getStorage: jest.fn(),
    connectStorageEmulator: jest.fn(),
  }
})

jest.mock('firebase/functions', () => {
  return {
    getFunctions: jest.fn(),
    connectFunctionsEmulator: jest.fn(),
  }
})

jest.mock('firebase/analytics', () => {
  return {
    getAnalytics: jest.fn(),
  }
})

jest.mock('firebase/database', () => {
  return {
    getDatabase: jest.fn(),
  }
})

// Axios v1 ships ESM entrypoints; mock it to avoid Jest ESM parsing issues.
jest.mock('axios', () => {
  const mockAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => mockAxios),
  }
  return { __esModule: true, default: mockAxios, ...mockAxios }
})
