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

const { onTestCreate } = await import('../src/triggers/onTestCreate.js');

describe('onTestCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should exit early if no data', async () => {
    const event = { data: null };
    await onTestCreate(event);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should fetch user and add test entry to myTests', async () => {
    const mockUser = {
      myTests: {},
    };
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
    const mockedNow = 987654321;
    Date.now = jest.fn(() => mockedNow);

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
          updateDate: mockedNow,
        }
      }
    });

    Date.now = originalDateNow;
  });
});
