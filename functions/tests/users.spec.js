import { jest } from '@jest/globals';

const mockDelete = jest.fn();
const mockGet = jest.fn();
const mockFilesDelete = jest.fn();
const mockDeleteUser = jest.fn();

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  admin: {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          delete: mockDelete,
        }),
        where: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      }),
    }),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue({
        getFiles: jest.fn().mockResolvedValue([[{ delete: mockFilesDelete }]]),
      }),
    }),
    auth: jest.fn().mockReturnValue({
      deleteUser: mockDeleteUser,
    }),
  },
  functions: {
    onCall: jest.fn((opts) => opts?.handler || opts),
  },
}));

const { deleteAuth } = await import('../src/https/users.js');

describe('users.js -> deleteAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user and associated tests seamlessly', async () => {
    mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: 'test-id-1',
          data: () => ({ answersDocId: 'answer-id-1' })
        }
      ]
    });

    const data = {
      data: {
        userId: 'dev-user-123'
      }
    };

    const res = await deleteAuth(data);
    expect(res).toBe('User deleted successfully.');
    expect(mockDelete).toHaveBeenCalledTimes(3); 
    expect(mockFilesDelete).toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalledWith('dev-user-123');
  });

  it('should skip tests deletion if testsQuery is empty', async () => {
     mockGet.mockResolvedValueOnce({
      empty: true,
      docs: []
     });

    const data = {
      data: {
        userId: 'dev-user-456'
      }
    };

    const res = await deleteAuth(data);
    expect(res).toBe('User deleted successfully.');
    expect(mockDelete).toHaveBeenCalledTimes(1); 
    expect(mockFilesDelete).not.toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalledWith('dev-user-456');
  });

  it('should catch error on exception', async () => {
    mockGet.mockRejectedValueOnce(new Error('DB Error'));

    const data = { data: { userId: 'err-user' }};
    const res = await deleteAuth(data);
    
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('DB Error');
  });
});
