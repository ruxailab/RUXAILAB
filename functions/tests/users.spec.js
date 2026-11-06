import { jest } from '@jest/globals';

const mockDelete = jest.fn();
const mockGet = jest.fn();
const mockDocGet = jest.fn();
const mockFilesDelete = jest.fn();
const mockDeleteUser = jest.fn();

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          delete: mockDelete,
          get: mockDocGet,
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
    https: {
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message)
          this.code = code
        }
      },
    },
  },
}));

const { deleteAuth } = await import('../src/https/users.js');

describe('users.js -> deleteAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw unauthenticated if request has no auth', async () => {
    const data = {
      data: {
        userId: 'dev-user-123',
      },
    };

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'unauthenticated',
      message: 'Authentication is required',
    });
  });

  it('should throw invalid-argument if userId is missing or invalid', async () => {
    const data = {
      auth: { uid: 'dev-user-123' },
      data: {},
    };

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'invalid-argument',
      message: 'userId is required',
    });
  });

  it('should throw permission-denied if caller is not the target user and not a super admin', async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ accessLevel: 1 }),
    });

    const data = {
      auth: { uid: 'caller-user-456' },
      data: { userId: 'target-user-123' },
    };

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'permission-denied',
      message: 'Permission denied',
    });
  });

  it('should allow a super admin to delete another user', async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ accessLevel: 0 }),
    });
    mockGet.mockResolvedValueOnce({
      empty: true,
      docs: [],
    });

    const data = {
      auth: { uid: 'admin-user-000' },
      data: { userId: 'target-user-123' },
    };

    const res = await deleteAuth(data);
    expect(res).toBe('User deleted successfully.');
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDeleteUser).toHaveBeenCalledWith('target-user-123');
  });

  it('should delete user and associated tests seamlessly when deleting self', async () => {
    mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: 'test-id-1',
          data: () => ({ answersDocId: 'answer-id-1' }),
        },
      ],
    });

    const data = {
      auth: {
        uid: 'dev-user-123',
      },
      data: {
        userId: 'dev-user-123',
      },
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
      docs: [],
    });

    const data = {
      auth: {
        uid: 'dev-user-456',
      },
      data: {
        userId: 'dev-user-456',
      },
    };

    const res = await deleteAuth(data);
    expect(res).toBe('User deleted successfully.');
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockFilesDelete).not.toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalledWith('dev-user-456');
  });

  it('should ignore auth/user-not-found error when deleting user from auth', async () => {
    mockGet.mockResolvedValueOnce({
      empty: true,
      docs: [],
    });
    const notFoundError = new Error('User not found');
    notFoundError.code = 'auth/user-not-found';
    mockDeleteUser.mockRejectedValueOnce(notFoundError);

    const data = {
      auth: {
        uid: 'dev-user-789',
      },
      data: {
        userId: 'dev-user-789',
      },
    };

    const res = await deleteAuth(data);
    expect(res).toBe('User deleted successfully.');
    expect(mockDeleteUser).toHaveBeenCalledWith('dev-user-789');
  });

  it('should throw HttpsError with code internal on unexpected exception', async () => {
    mockGet.mockRejectedValueOnce(new Error('DB Error'));

    const data = {
      auth: { uid: 'err-user' },
      data: { userId: 'err-user' },
    };

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'internal',
      message: 'DB Error',
    });
  });

  it('should re-throw an existing HttpsError unchanged', async () => {
    const { functions: mockFunctions } = await import(
      '../src/core/firebase/f.firebase.js'
    );
    const httpsError = new mockFunctions.https.HttpsError(
      'not-found',
      'User not found',
    );
    mockGet.mockRejectedValueOnce(httpsError);

    const data = {
      auth: { uid: 'err-user-2' },
      data: { userId: 'err-user-2' },
    };

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'not-found',
      message: 'User not found',
    });
  });
});
