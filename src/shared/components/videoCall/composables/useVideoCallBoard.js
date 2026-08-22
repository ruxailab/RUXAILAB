import { computed, unref } from 'vue'
import { ACCESS_LEVEL, normalizeAccessLevel } from '@/shared/utils/accessLevel'
import { getMemberIdentityKeys } from '@/ux/UserTest/utils/sessionPresence'

export function useVideoCallBoard({
  t,
  isObservator,
  callStarted = computed(() => false),
  isCameraEnabled,
  isMicrophoneEnabled,
  user,
  localStream,
  remoteEntries,
  screenShareFeeds,
  staffParticipants = computed(() => []),
  buildRemoteTile,
  buildParticipantItem,
}) {
  const currentUser = computed(() => unref(user) || {})
  const isCurrentUserModerator = computed(
    () =>
      Boolean(currentUser.value.isModerator) ||
      normalizeAccessLevel(currentUser.value.accessLevel) ===
        ACCESS_LEVEL.ADMIN,
  )

  const isObserverRole = (entry) => {
    if (!entry) return false

    const role = String(entry?.role ?? '')
      .trim()
      .toLowerCase()
    const accessLevel = normalizeAccessLevel(entry?.accessLevel ?? entry?.role)

    return (
      role === 'observer' ||
      role === 'observator' ||
      accessLevel === ACCESS_LEVEL.OBSERVATOR ||
      entry?.isObserver === true
    )
  }

  const isCurrentUserEntry = (entry) => {
    const currentKeys = new Set(getMemberIdentityKeys(currentUser.value))
    return getMemberIdentityKeys(entry).some((key) => currentKeys.has(key))
  }

  const visibleRemoteEntries = computed(() =>
    remoteEntries.value.filter((remote) => {
      if (!remote) return false
      if (isCurrentUserEntry(remote)) return false

      const remoteIsObserver = isObserverRole(remote)

      if (isCurrentUserModerator.value) {
        return true
      }

      if (remoteIsObserver) {
        return !callStarted.value
      }

      return true
    }),
  )

  const tiles = computed(() => {
    const list = []

    const shouldShowLocalCamera =
      isCurrentUserModerator.value || !isObservator.value || !callStarted.value

    if (shouldShowLocalCamera) {
      list.push({
        id: 'local-camera',
        type: 'camera',
        kind: 'local',
        label: `${t('videoCall.session.yourVideo')} (${currentUser.value.email?.split('@')[0] ?? ''})`,
        hasCamera: isCameraEnabled.value,
        hasMicrophone: isMicrophoneEnabled.value,
        muted: true,
        ...(localStream?.value ? { stream: localStream.value } : {}),
      })
    }

    visibleRemoteEntries.value.forEach((remote) => {
      list.push(buildRemoteTile(remote))
    })

    screenShareFeeds.value.forEach((feed) => {
      list.push({
        id: `screen:${feed.key}`,
        type: 'screen',
        feedKey: feed.key,
        label:
          feed.label ||
          `${t('videoCall.session.screenSharingLabel')} (${feed.name || ''})`,
        muted: true,
        ...(feed.stream ? { stream: feed.stream } : {}),
      })
    })

    return list
  })

  const focusedTile = computed(
    () => tiles.value.find((tile) => tile.type === 'screen') || null,
  )
  const otherTiles = computed(() =>
    tiles.value.filter((tile) => tile.type !== 'screen'),
  )
  const isFocusMode = computed(() => !!focusedTile.value)

  const showWaitingMessage = computed(
    () =>
      !isFocusMode.value &&
      visibleRemoteEntries.value.length === 0 &&
      screenShareFeeds.value.length === 0,
  )

  const cameraCount = computed(
    () => tiles.value.filter((tile) => tile.type === 'camera').length,
  )

  const tileCols = computed(() => {
    const count = cameraCount.value
    if (count <= 1) return 12
    if (count === 3) return 4
    if (count <= 4) return 6
    if (count <= 9) return 4
    return 3
  })

  const participantsList = computed(() => {
    const list = []
    const seen = new Set()

    const addEntry = (entry) => {
      if (!entry || !entry.id) return
      if (seen.has(entry.id)) return
      seen.add(entry.id)
      list.push(entry)
    }

    const normalizedUserAccessLevel = normalizeAccessLevel(
      currentUser.value.accessLevel,
    )
    const localRole = isObservator.value
      ? 'observator'
      : normalizedUserAccessLevel === ACCESS_LEVEL.ADMIN || user?.isModerator
        ? 'moderator'
        : normalizedUserAccessLevel === ACCESS_LEVEL.OBSERVATOR
          ? 'observator'
          : 'participant'

    addEntry(
      buildParticipantItem(
        {
          id: currentUser.value.id,
          email: currentUser.value.email,
          name: currentUser.value.email?.split('@')[0] || 'You',
          isSelf: true,
          role: localRole,
          connected: true,
          hasCamera: !isObservator.value && isCameraEnabled.value,
          hasMicrophone: !isObservator.value && isMicrophoneEnabled.value,
        },
        true,
      ),
    )

    staffParticipants.value.forEach((staffMember) => {
      if (
        !staffMember ||
        !staffMember.id ||
        isCurrentUserEntry(staffMember) ||
        isObserverRole(staffMember)
      ) {
        return
      }
      addEntry(
        buildParticipantItem(
          {
            ...staffMember,
            id: staffMember.id,
            name:
              staffMember.name ||
              staffMember.email?.split('@')[0] ||
              'Staff member',
            email: staffMember.email,
            role:
              staffMember.role ||
              (normalizeAccessLevel(staffMember.accessLevel) ===
              ACCESS_LEVEL.OBSERVATOR
                ? 'observator'
                : normalizeAccessLevel(staffMember.accessLevel) ===
                    ACCESS_LEVEL.ADMIN
                  ? 'moderator'
                  : 'participant'),
            connected: Boolean(staffMember.connected),
            hasCamera: staffMember.hasCamera ?? true,
            hasMicrophone: staffMember.hasMicrophone ?? true,
          },
          false,
        ),
      )
    })

    remoteEntries.value.forEach((remote) => {
      if (isCurrentUserEntry(remote) || isObserverRole(remote)) return
      addEntry(buildParticipantItem(remote, false))
    })

    return list
  })

  return {
    tiles,
    focusedTile,
    otherTiles,
    isFocusMode,
    showWaitingMessage,
    cameraCount,
    tileCols,
    participantsList,
  }
}
