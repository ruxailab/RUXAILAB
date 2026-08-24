import { jest } from '@jest/globals';

const mockGet = jest.fn();
const mockUpdate = jest.fn();

jest.unstable_mockModule('../src/repositories/UserRepository.js', () => ({
  default: class UserRepositoryMock {
    get(...args) { return mockGet(...args); }
    update(...args) { return mockUpdate(...args); }
  }
}));

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  functions: {
    onTrigger: jest.fn((opts) => opts?.handler || opts),
  },
}));

const { onTestCreate } = await import('../src/triggers/onTestCreate.js');
const { onTestUpdate } = await import('../src/triggers/onTestUpdate.js');

describe('Test Triggers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onTestCreate', () => {
    it('should exit early if no data', async () => {
      const event = { data: null };
      await onTestCreate(event);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should fetch user and add test entry to myTests', async () => {
      const mockUser = { myTests: {} };
      mockGet.mockResolvedValueOnce(mockUser);
      
      const event = {
        data: {
          id: 'test-document-id',
          data: () => ({
            testAdmin: { userDocId: 'user-doc-123' },
            testTitle: 'My New Test',
            testType: 'HEURISTIC',
            cooperators: ['a', 'b'],
            creationDate: 123456789,
          })
        }
      };

      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 987654321);

      await onTestCreate(event);

      expect(mockGet).toHaveBeenCalledWith('user-doc-123');
      expect(mockUpdate).toHaveBeenCalledWith('user-doc-123', {
        myTests: {
          'test-document-id': {
            testDocId: 'test-document-id',
            testTitle: 'My New Test',
            testType: 'HEURISTIC',
            subType: null,
            numberColaborators: 2,
            creationDate: 123456789,
            updateDate: 987654321,
          }
        }
      });

      Date.now = originalDateNow;
    });
  });

  describe('onTestUpdate', () => {
    it('should exit early if no data.after is provided', async () => {
      const event = { data: { after: null } };
      await onTestUpdate(event);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should update user myTests field on test update', async () => {
      const mockUser = {
        myTests: {
          'test-document-id': { testTitle: 'Old Title' }
        },
      };
      mockGet.mockResolvedValueOnce(mockUser);
      
      const event = {
        data: {
          after: {
            id: 'test-document-id',
            data: () => ({
              testAdmin: { userDocId: 'user-doc-123' },
              testTitle: 'Updated Test Title',
              testType: 'SURVEY',
              subType: 'GENERAL',
              cooperators: ['a', 'b', 'c'],
              creationDate: 123456789,
            })
          }
        }
      };

      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 987654321);

      await onTestUpdate(event);

      expect(mockGet).toHaveBeenCalledWith('user-doc-123');
      expect(mockUpdate).toHaveBeenCalledWith('user-doc-123', {
        myTests: {
          'test-document-id': {
            testDocId: 'test-document-id',
            testTitle: 'Updated Test Title',
            testType: 'SURVEY',
            subType: 'GENERAL',
            numberColaborators: 3,
            creationDate: 123456789,
            updateDate: 987654321,
          }
        }
      });

      Date.now = originalDateNow;
    });
  });
});
