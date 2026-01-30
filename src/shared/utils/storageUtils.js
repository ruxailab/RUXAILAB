import { getStorage, ref, listAll, deleteObject } from 'firebase/storage'

/**
 * Recursively deletes all files and subfolders at the specified storage path.
 * @param {string} path - The path to the folder to clean (e.g., 'users/123').
 * @returns {Promise<void>}
 */
export async function cleanStorage(path) {
  const storage = getStorage()
  const listRef = ref(storage, path)

  try {
    const res = await listAll(listRef)

    // Delete all files in this folder
    const fileDeletionPromises = res.items.map((itemRef) =>
      deleteObject(itemRef),
    )
    await Promise.all(fileDeletionPromises)

    // Recursively clean subfolders
    const folderCleaningPromises = res.prefixes.map((folderRef) =>
      cleanStorage(folderRef.fullPath),
    )
    await Promise.all(folderCleaningPromises)
  } catch (error) {
    console.error(`Error cleaning storage at path ${path}:`, error)
    throw error
  }
}
