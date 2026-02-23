import { jest } from '@jest/globals';

const mockGet = jest.fn();
const mockUpdate = jest.fn();

jest.unstable_mockModule('../src/repositories/UserRepository.js', () => ({
  default: class UserRepositoryMock {
    get(...args) { return mockGet(...args); }
    update(...args) { return mockUpdate(...args); }
  }
}));

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  functions: {
    onTrigger: jest.fn((opts) => opts?.handler || opts),
  },
}));

const { onTestUpdate } = await import('../src/triggers/onTestUpdate.js');

describe('onTestUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should exit early if no data.after is provided', async () => {
    const event = { data: { after: null } };
    await onTestUpdate(event);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should update user myTests field on test update', async () => {
    const mockUser = {
      myTests: {
        'test-document-id': {
           testTitle: 'Old Title',
        }
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
    const mockedNow = 987654321;
    Date.now = jest.fn(() => mockedNow);

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
          updateDate: mockedNow,
        }
      }
    });

    Date.now = originalDateNow;
  });
});
