import { cleanStorage } from '@/shared/utils/storageUtils'
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage'

// Mock firebase/storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  listAll: jest.fn(),
  deleteObject: jest.fn(),
}))

describe('storageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getStorage.mockReturnValue({}) // Mock storage instance
  })

  it('should delete all files in a folder', async () => {
    const path = 'some/path'
    const mockItems = [{ name: 'file1' }, { name: 'file2' }]

    ref.mockImplementation((storage, p) => ({ fullPath: p }))

    listAll.mockResolvedValue({
      items: mockItems,
      prefixes: [],
    })
    deleteObject.mockResolvedValue(undefined)

    await cleanStorage(path)

    expect(getStorage).toHaveBeenCalled()
    expect(ref).toHaveBeenCalledWith(expect.anything(), path)
    expect(listAll).toHaveBeenCalledWith({ fullPath: path })
    expect(deleteObject).toHaveBeenCalledTimes(2)
    expect(deleteObject).toHaveBeenCalledWith(mockItems[0])
    expect(deleteObject).toHaveBeenCalledWith(mockItems[1])
  })

  it('should recursively clean subfolders', async () => {
    const rootPath = 'root'
    const subfolderPath = 'root/sub'

    ref.mockImplementation((storage, p) => ({ fullPath: p }))

    // First call for root: 1 file, 1 subfolder
    listAll.mockResolvedValueOnce({
      items: [{ name: 'rootFile' }],
      prefixes: [{ fullPath: subfolderPath }],
    })

    // Second call for subfolder: 1 file, 0 subfolders
    listAll.mockResolvedValueOnce({
      items: [{ name: 'subFile' }],
      prefixes: [],
    })

    deleteObject.mockResolvedValue(undefined)

    await cleanStorage(rootPath)

    expect(listAll).toHaveBeenCalledTimes(2)
    // First call checking root
    expect(listAll).toHaveBeenCalledWith({ fullPath: rootPath })
    // Second call checking subfolder
    expect(listAll).toHaveBeenCalledWith({ fullPath: subfolderPath })

    expect(deleteObject).toHaveBeenCalledTimes(2)
  })

  it('should handle errors gracefully', async () => {
    const path = 'error/path'
    const error = new Error('Storage error')

    ref.mockImplementation((storage, p) => ({ fullPath: p }))
    listAll.mockRejectedValue(error)

    // Suppress console.error for this test as we expect it
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await expect(cleanStorage(path)).rejects.toThrow('Storage error')

    expect(consoleSpy).toHaveBeenCalledWith(
      `Error cleaning storage at path ${path}:`,
      error,
    )
    consoleSpy.mockRestore()
  })
})
