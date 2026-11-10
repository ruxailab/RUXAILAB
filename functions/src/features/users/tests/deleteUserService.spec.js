import { jest } from '@jest/globals'
import { DeleteUserService } from '../service/DeleteUserService.js'
import { UserStorageRepository } from '../repositories/UserStorageRepository.js'
import { UserAuthRepository } from '../repositories/UserAuthRepository.js'

describe('DeleteUserService', () => {
  const createService = ({
    isSuperAdmin = false,
    studies = [],
  } = {}) => {
    const userRepository = {
      isSuperAdmin: jest.fn(async () => isSuperAdmin),
      delete: jest.fn(async () => undefined),
    }
    const studyRepository = {
      listByAdmin: jest.fn(async () => studies),
      delete: jest.fn(async () => undefined),
    }
    const answerRepository = {
      delete: jest.fn(async () => undefined),
    }
    const storageRepository = {
      deleteFolderFiles: jest.fn(async () => 0),
    }
    const authRepository = {
      deleteUser: jest.fn(async () => undefined),
    }

    const service = new DeleteUserService({
      userRepository,
      studyRepository,
      answerRepository,
      storageRepository,
      authRepository,
    })

    return {
      service,
      userRepository,
      studyRepository,
      answerRepository,
      storageRepository,
      authRepository,
    }
  }

  describe('authorize', () => {
    it('allows user to delete their own account', async () => {
      const { service, userRepository } = createService()

      await expect(
        service.authorize('user-1', 'user-1'),
      ).resolves.toBeUndefined()
      expect(userRepository.isSuperAdmin).not.toHaveBeenCalled()
    })

    it('allows a super-admin to delete another user account', async () => {
      const { service, userRepository } = createService({ isSuperAdmin: true })

      await expect(
        service.authorize('admin-1', 'user-1'),
      ).resolves.toBeUndefined()
      expect(userRepository.isSuperAdmin).toHaveBeenCalledWith('admin-1')
    })

    it('rejects a non-admin attempting to delete another user account', async () => {
      const { service, userRepository } = createService({ isSuperAdmin: false })

      await expect(
        service.authorize('stranger', 'user-1'),
      ).rejects.toMatchObject({
        code: 'permission-denied',
        message: 'Permission denied',
      })
      expect(userRepository.isSuperAdmin).toHaveBeenCalledWith('stranger')
    })
  })

  describe('deleteUserStudies', () => {
    it('deletes answers doc, storage folder files, and study doc for each study', async () => {
      const studies = [
        { id: 'study-1', answersDocId: 'answer-1' },
        { id: 'study-2' }, // without answersDocId
      ]
      const {
        service,
        studyRepository,
        answerRepository,
        storageRepository,
      } = createService({ studies })

      await service.deleteUserStudies('user-1')

      expect(studyRepository.listByAdmin).toHaveBeenCalledWith('user-1')
      expect(answerRepository.delete).toHaveBeenCalledTimes(1)
      expect(answerRepository.delete).toHaveBeenCalledWith('answer-1')
      expect(storageRepository.deleteFolderFiles).toHaveBeenCalledWith(
        'tests/study-1/',
      )
      expect(storageRepository.deleteFolderFiles).toHaveBeenCalledWith(
        'tests/study-2/',
      )
      expect(studyRepository.delete).toHaveBeenCalledWith('study-1')
      expect(studyRepository.delete).toHaveBeenCalledWith('study-2')
    })

    it('does nothing when the user administers no studies', async () => {
      const {
        service,
        studyRepository,
        answerRepository,
        storageRepository,
      } = createService({ studies: [] })

      await service.deleteUserStudies('user-1')

      expect(studyRepository.listByAdmin).toHaveBeenCalledWith('user-1')
      expect(answerRepository.delete).not.toHaveBeenCalled()
      expect(storageRepository.deleteFolderFiles).not.toHaveBeenCalled()
      expect(studyRepository.delete).not.toHaveBeenCalled()
    })
  })

  describe('execute', () => {
    it('coordinates the full deletion flow and returns success', async () => {
      const studies = [{ id: 'study-1', answersDocId: 'ans-1' }]
      const {
        service,
        userRepository,
        studyRepository,
        answerRepository,
        storageRepository,
        authRepository,
      } = createService({ isSuperAdmin: false, studies })

      const result = await service.execute({
        uid: 'user-1',
        input: { userId: 'user-1' },
      })

      expect(result).toBe('User deleted successfully.')
      expect(studyRepository.listByAdmin).toHaveBeenCalledWith('user-1')
      expect(answerRepository.delete).toHaveBeenCalledWith('ans-1')
      expect(storageRepository.deleteFolderFiles).toHaveBeenCalledWith(
        'tests/study-1/',
      )
      expect(studyRepository.delete).toHaveBeenCalledWith('study-1')
      expect(userRepository.delete).toHaveBeenCalledWith('user-1')
      expect(authRepository.deleteUser).toHaveBeenCalledWith('user-1')
    })
  })
})

describe('UserStorageRepository', () => {
  it('deletes all files found under the prefix', async () => {
    const file1 = { delete: jest.fn(async () => undefined) }
    const file2 = { delete: jest.fn(async () => undefined) }
    const bucket = {
      getFiles: jest.fn(async () => [[file1, file2]]),
    }
    const storage = { bucket: () => bucket }
    const repo = new UserStorageRepository(storage)

    const count = await repo.deleteFolderFiles('tests/study-1/')

    expect(count).toBe(2)
    expect(bucket.getFiles).toHaveBeenCalledWith({ prefix: 'tests/study-1/' })
    expect(file1.delete).toHaveBeenCalled()
    expect(file2.delete).toHaveBeenCalled()
  })

  it('returns 0 when no files exist', async () => {
    const bucket = {
      getFiles: jest.fn(async () => [[]]),
    }
    const storage = { bucket: () => bucket }
    const repo = new UserStorageRepository(storage)

    const count = await repo.deleteFolderFiles('tests/empty/')

    expect(count).toBe(0)
  })

  it('handles null storage gracefully', async () => {
    const repo = new UserStorageRepository(null)
    const count = await repo.deleteFolderFiles('tests/any/')
    expect(count).toBe(0)
  })
})

describe('UserAuthRepository', () => {
  it('calls auth.deleteUser with the provided uid', async () => {
    const auth = { deleteUser: jest.fn(async () => undefined) }
    const repo = new UserAuthRepository(auth)

    await repo.deleteUser('user-123')

    expect(auth.deleteUser).toHaveBeenCalledWith('user-123')
  })

  it('safely catches and ignores auth/user-not-found error', async () => {
    const notFoundError = new Error('User not found')
    notFoundError.code = 'auth/user-not-found'
    const auth = {
      deleteUser: jest.fn(async () => {
        throw notFoundError
      }),
    }
    const repo = new UserAuthRepository(auth)

    await expect(repo.deleteUser('missing-user')).resolves.toBeUndefined()
    expect(auth.deleteUser).toHaveBeenCalledWith('missing-user')
  })

  it('re-throws unexpected auth errors', async () => {
    const unexpectedError = new Error('Auth network failure')
    unexpectedError.code = 'auth/internal-error'
    const auth = {
      deleteUser: jest.fn(async () => {
        throw unexpectedError
      }),
    }
    const repo = new UserAuthRepository(auth)

    await expect(repo.deleteUser('err-user')).rejects.toThrow(
      'Auth network failure',
    )
  })

  it('handles null auth gracefully', async () => {
    const repo = new UserAuthRepository(null)
    await expect(repo.deleteUser('any-user')).resolves.toBeUndefined()
  })
})

