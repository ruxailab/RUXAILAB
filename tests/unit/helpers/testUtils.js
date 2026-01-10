export function createControllerSpies(controller) {
    const parentProto = Object.getPrototypeOf(Object.getPrototypeOf(controller))
    
    const spies = {
        readOne: jest.spyOn(parentProto, 'readOne'),
        update: jest.spyOn(parentProto, 'update'),
        create: jest.spyOn(parentProto, 'create'),
        delete: jest.spyOn(parentProto, 'delete'),
        getDeleteField: jest.spyOn(parentProto, 'getDeleteField')
    }

    return {
        ...spies,
        mockReadOne: (value) => spies.readOne.mockResolvedValueOnce(value),
        mockUpdate: () => spies.update.mockResolvedValue(),
        mockDeleteField: (value = 'DELETE_FIELD_SENTINEL') => spies.getDeleteField.mockReturnValue(value),
        restore: () => Object.values(spies).forEach(spy => spy.mockRestore())
    }
}

export function createMockDoc(exists = true) {
    return { exists: () => exists }
}

export const firestoreMock = {
    doc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    deleteField: jest.fn(() => 'DELETE_FIELD_SENTINEL')
}

export const firebaseAppMock = {
    db: {}
}

export const studyTypesMock = {
    STUDY_TYPES: {
        HEURISTIC: 'HEURISTIC',
        USER: 'USER'
    }
}
