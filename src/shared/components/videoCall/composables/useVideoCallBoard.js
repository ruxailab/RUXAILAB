import { computed } from 'vue'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { useVideoFocus } from './useVideoFocus'

export function useVideoCallBoard({
  t,
  isObservator,
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
  const tiles = computed(() => {
    const list = []

    if (!isObservator.value) {
      list.push({
        id: 'local-camera',
        type: 'camera',
        kind: 'local',
        label: `${t('videoCall.session.yourVideo')} (${
          user?.email?.split('@')[0] ?? ''
        })`,
        hasCamera: isCameraEnabled.value,
        hasMicrophone: isMicrophoneEnabled.value,
        muted: true,
        ...(localStream?.value ? { stream: localStream.value } : {}),
      })
    }

    remoteEntries.value.forEach((remote) => {
      list.push(buildRemoteTile(remote))
    })

    screenShareFeeds.value.forEach((feed) => {
      list.push({
        id: `screen:${feed.key}`,
        type: 'screen',
        feedKey: feed.key,
        label: `${t('videoCall.session.screenSharingLabel')} (${feed.name})`,
        muted: !!feed.isLocal,
        ...(feed.stream ? { stream: feed.stream } : {}),
      })
    })

    return list
  })

  const { focusedTile, otherTiles, isFocusMode, focusTile, clearFocus } =
    useVideoFocus(tiles)

  const showWaitingMessage = computed(
    () =>
      !isFocusMode.value &&
      remoteEntries.value.length === 0 &&
      screenShareFeeds.value.length === 0,
  )

  const cameraCount = computed(
    () => (isObservator.value ? 0 : 1) + remoteEntries.value.length,
  )

  const cameraColumns = computed(() => {
    const count = cameraCount.value
    if (count <= 1) return 1
    if (count <= 4) return 2
    if (count <= 9) return 3
    return 4
  })

  const gridStyleVars = computed(() => ({
    '--grid-cols': cameraColumns.value,
  }))

  const participantsList = computed(() => {
    const list = []
    const seen = new Set()

    const addEntry = (entry) => {
      if (!entry || !entry.id) return
      if (seen.has(entry.id)) return
      seen.add(entry.id)
      list.push(entry)
    }

    const localRole = isObservator.value
      ? 'observator'
      : user?.accessLevel === ACCESS_LEVEL.ADMIN || user?.isModerator
        ? 'moderator'
        : user?.accessLevel === ACCESS_LEVEL.OBSERVATOR
          ? 'observator'
          : 'participant'

    addEntry(
      buildParticipantItem(
        {
          id: user?.id,
          email: user?.email,
          name: user?.email?.split('@')[0] || 'You',
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
      if (!staffMember || !staffMember.id || staffMember.id === user?.id) return
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
              (staffMember.accessLevel === ACCESS_LEVEL.OBSERVATOR
                ? 'observator'
                : staffMember.accessLevel === ACCESS_LEVEL.ADMIN
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
      if (remote?.id === user?.id) return
      addEntry(buildParticipantItem(remote, false))
    })

    return list
  })

  return {
    tiles,
    focusedTile,
    otherTiles,
    isFocusMode,
    focusTile,
    clearFocus,
    showWaitingMessage,
    cameraCount,
    cameraColumns,
    gridStyleVars,
    participantsList,
  }
}
