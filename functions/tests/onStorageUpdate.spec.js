import { jest } from '@jest/globals';

const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockCommit = jest.fn();
const mockGetFiles = jest.fn();

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  admin: {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      }),
      batch: jest.fn().mockReturnValue({
        update: mockUpdate,
        commit: mockCommit,
      }),
    }),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue({
        getFiles: mockGetFiles,
      }),
    }),
  },
  functions: {
    onStorageTrigger: jest.fn((opts) => opts?.handler || opts),
    https: {
      onCall: jest.fn((opts) => opts),
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message);
          this.code = code;
        }
      }
    }
  },
}));

const {
  onStorageUpdate,
  onStorageDelete,
  calculateStorageUsage,
} = await import('../src/triggers/onStorageUpdate.js');

describe('onStorageUpdate.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onStorageUpdate', () => {
    it('returns null if file path does not match tests/', async () => {
      const event = { data: { name: 'otherFolder/file.jpg' } };
      const res = await onStorageUpdate(event);
      expect(res).toBeNull();
    });

    it('returns null if querying users returns empty', async () => {
      const event = { data: { name: 'tests/test1234/file.jpg' } };
      mockGet.mockResolvedValueOnce({ empty: true });

      const res = await onStorageUpdate(event);
      expect(res).toBeNull();
      expect(mockGetFiles).not.toHaveBeenCalled();
    });

    it('calculates storage correctly for test ID and updates user usage', async () => {
      const event = { data: { name: 'tests/test1234/file.jpg' } };
      
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            ref: 'mock-doc-ref',
            data: () => ({ myTests: { 'test1234': true, 'test5678': true } })
          }
        ]
      });

      mockGetFiles
        .mockResolvedValueOnce([[{ metadata: { size: 1048576 } }]]) 
        .mockResolvedValueOnce([[{ metadata: { size: 2097152 } }]]); 
      
      await onStorageUpdate(event);

      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-doc-ref',
        { storageUsageMB: 3 }
      );
      expect(mockCommit).toHaveBeenCalled();
    });

    it('handles exceptions gracefully', async () => {
      const event = { data: { name: 'tests/test1234/file.jpg' } };
      mockGet.mockRejectedValueOnce(new Error('Firestore Error'));

      await onStorageUpdate(event);
      expect(mockGetFiles).not.toHaveBeenCalled();
    });
  });

  describe('onStorageDelete', () => {
    it('recalculates storage usage after a file deletion', async () => {
      const event = { data: { name: 'tests/test1234/file.jpg' } };

      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            ref: 'mock-doc-ref',
            data: () => ({ myTests: { test1234: true } }),
          },
        ],
      });

      mockGetFiles.mockResolvedValueOnce([[{ metadata: { size: 1048576 } }]]);

      await onStorageDelete(event);

      expect(mockUpdate).toHaveBeenCalledWith('mock-doc-ref', {
        storageUsageMB: 1,
      });
      expect(mockCommit).toHaveBeenCalled();
    });
  });

  describe('calculateStorageUsage', () => {
    it('throws error if testIds is empty or invalid', async () => {
      await expect(calculateStorageUsage({ testIds: [] }))
        .rejects.toThrow('No testIds provided.');
      await expect(calculateStorageUsage({ testIds: null }))
        .rejects.toThrow('No testIds provided.');
    });

    it('returns accumulated and perTest storage accurately', async () => {
      mockGetFiles
        .mockResolvedValueOnce([[{ metadata: { size: 1048576 * 2 } }]]) 
        .mockResolvedValueOnce([[{ metadata: { size: 1048576 * 3 } }]]);
      
      const res = await calculateStorageUsage({ testIds: ['t1', 't2'] });

      expect(res.totalSizeMB).toBe('5.00');
      expect(res.perTest).toEqual([
         { testId: 't1', sizeMB: '2.00' },
         { testId: 't2', sizeMB: '3.00' }
      ]);
    });
  });
});
