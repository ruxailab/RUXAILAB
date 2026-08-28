/**
 * Pure helpers for splitting Focus Group participants into breakout groups.
 * Kept free of Vue/Firebase so the grouping logic is trivially unit-testable;
 * the session composable only ever writes the resulting plain object.
 */

/**
 * The largest group count that still gives every group at least 2 people.
 * A round-robin split with fewer than 2 per group routinely strands someone
 * alone (e.g. 4 participants into 3 groups yields 2/1/1), which defeats the
 * point of a breakout discussion, so callers should treat this as the max
 * selectable group count.
 *
 * @param {string[]} participantIds
 * @returns {number}
 */
export function maxGroupCount(participantIds) {
  return Math.max(1, Math.floor((participantIds ?? []).length / 2))
}

/**
 * Splits participant ids round-robin into `groupCount` groups, so group
 * sizes differ by at most one. Clamped to at least 1 group and at most
 * `maxGroupCount` groups, so no group ever ends up with a single, isolated
 * participant.
 *
 * @param {string[]} participantIds
 * @param {number} groupCount
 * @returns {Object} { [groupId]: { name, participantIds: string[] } }
 */
export function splitIntoGroups(participantIds, groupCount) {
  const ids = participantIds ?? []
  const count = Math.max(1, Math.min(groupCount || 1, maxGroupCount(ids)))

  const groups = {}
  for (let i = 0; i < count; i += 1) {
    groups[`group-${i + 1}`] = { name: `Group ${i + 1}`, participantIds: [] }
  }

  ids.forEach((id, index) => {
    const groupId = `group-${(index % count) + 1}`
    groups[groupId].participantIds.push(id)
  })

  return groups
}

/**
 * Moves a participant to a different group, removing them from whichever
 * group they were previously in. No-op target group id leaves them
 * unassigned (removed from all groups).
 *
 * @param {Object} groups
 * @param {string} userId
 * @param {string} targetGroupId
 * @returns {Object} a new groups object; input is not mutated.
 */
export function reassignParticipant(groups, userId, targetGroupId) {
  const next = {}
  Object.entries(groups ?? {}).forEach(([groupId, group]) => {
    next[groupId] = {
      ...group,
      participantIds: (group.participantIds ?? []).filter(
        (id) => id !== userId,
      ),
    }
  })

  if (next[targetGroupId]) {
    next[targetGroupId] = {
      ...next[targetGroupId],
      participantIds: [...next[targetGroupId].participantIds, userId],
    }
  }

  return next
}
