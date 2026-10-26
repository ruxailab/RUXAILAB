/** Merge session query results without duplicating documents found by email and uid. */
export function dedupeSessionsByPath(...groups) {
  const sessions = groups.flat()
  return sessions.filter(
    (session, index, array) =>
      array.findIndex((item) => item.path === session.path) === index,
  )
}
