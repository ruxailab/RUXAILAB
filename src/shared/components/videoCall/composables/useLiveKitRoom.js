import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client'
import { getLiveKitCredentials } from '../services/livekitTokenProvider'
import { ACCESS_LEVEL, normalizeAccessLevel } from '@/shared/utils/accessLevel'
import { roleFromAccessLevel, VIDEO_CALL_ROLES } from './videoCallRoles'

const MEDIA_DEVICE_ERROR_KEYS = {
  NotFoundError: 'mediaDeviceNotFound',
  NotAllowedError: 'mediaPermissionDenied',
  NotReadableError: 'mediaDeviceInUse',
  OverconstrainedError: 'mediaConstraintsNotSupported',
  AbortError: 'mediaDeviceUnavailable',
}

function formatMediaDeviceError(error, deviceKey, t) {
  if (!navigator.mediaDevices) {
    return getMediaDevicesUnavailableMessage(deviceKey, t)
  }

  const errorName = error instanceof DOMException ? error.name : ''
  const messageKey =
    MEDIA_DEVICE_ERROR_KEYS[errorName] || 'mediaDeviceUnavailable'

  return t(`UserTestView.VideoCall.${messageKey}`, {
    device: t(`UserTestView.VideoCall.${deviceKey}`),
  })
}

function getMediaDevicesUnavailableMessage(deviceKey, t) {
  const device = t(`UserTestView.VideoCall.${deviceKey}`)
  if (!window.isSecureContext) {
    return t('UserTestView.VideoCall.secureContextRequired', { device })
  }
  return t('UserTestView.VideoCall.mediaDeviceUnavailable', { device })
}

function logMediaDeviceError(error, deviceKey, t) {
  const message = formatMediaDeviceError(error, deviceKey, t)
  console.warn(message, error) // eslint-disable-line no-console
}

export function useLiveKitRoom({
  testId,
  userId,
  displayName,
  accessLevel,
  cooperators,
  onRemoteModeratorStream,
  onModeratorStatusChange,
}) {
  const { t } = useI18n()

  const room = ref(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref(null)
  const remoteParticipants = ref([])
  const isCameraEnabled = ref(true)
  const isMicrophoneEnabled = ref(true)
  const isSharingScreen = ref(false)

  const isObservator = computed(
    () => normalizeAccessLevel(accessLevel.value) === ACCESS_LEVEL.OBSERVATOR,
  )

  const callStarted = computed(
    () => isConnected.value && room.value?.state === ConnectionState.Connected,
  )

  const localVideoElement = ref(null)
  const screenShareFeeds = ref([])
  const remoteVideoElements = new Map()
  const screenShareElements = new Map()
  let moderatorMediaStream = null

  function buildScreenShareKey(identity) {
    return `${identity}:screen`
  }

  function upsertScreenShareFeed({ key, identity, name, isLocal }) {
    if (screenShareFeeds.value.some((feed) => feed.key === key)) return
    screenShareFeeds.value = [
      ...screenShareFeeds.value,
      { key, identity, name, isLocal },
    ]
  }

  function removeScreenShareFeed(key) {
    screenShareFeeds.value = screenShareFeeds.value.filter(
      (feed) => feed.key !== key,
    )
    screenShareElements.delete(key)
  }

  function clearScreenShareFeeds() {
    screenShareFeeds.value = []
    screenShareElements.clear()
  }

  function attachScreenShareTrack(key, track) {
    if (!track || track.kind !== Track.Kind.Video) return
    attachVideoTrack(track, screenShareElements.get(key))
  }

  function isModeratorIdentity(identity) {
    const coop = cooperators.value?.find((c) => c.userDocId === identity)
    return coop?.accessLevel === ACCESS_LEVEL.ADMIN
  }

  function getParticipantRole(identity) {
    const coop = cooperators.value?.find((c) => c.userDocId === identity)
    if (!coop) return VIDEO_CALL_ROLES.PARTICIPANT
    return roleFromAccessLevel(coop.accessLevel)
  }

  function syncLocalMediaState() {
    if (!room.value) return
    isCameraEnabled.value = room.value.localParticipant.isCameraEnabled
    isMicrophoneEnabled.value = room.value.localParticipant.isMicrophoneEnabled
  }

  function syncRemoteParticipants() {
    if (!room.value) {
      remoteParticipants.value = []
      return
    }

    const list = []
    room.value.remoteParticipants.forEach((participant) => {
      list.push({
        identity: participant.identity,
        name: participant.name || participant.identity,
        role: getParticipantRole(participant.identity),
        isConnected: true,
        hasCamera: participant.isCameraEnabled,
        hasMicrophone: participant.isMicrophoneEnabled,
      })
    })
    remoteParticipants.value = list
  }

  function attachVideoTrack(track, element) {
    if (!element || track.kind !== Track.Kind.Video) return
    track.attach(element)
  }

  function attachAudioTrack(track) {
    if (track.kind !== Track.Kind.Audio) return
    track.attach()
  }

  async function startRoomAudio(lkRoom) {
    if (!lkRoom?.startAudio) return
    try {
      await lkRoom.startAudio()
    } catch (error) {
      console.warn('Failed to start LiveKit audio playback', error) // eslint-disable-line no-console
    }
  }

  function updateModeratorMediaStream(participant, track, publication) {
    if (publication?.source === Track.Source.ScreenShare) return
    if (!isModeratorIdentity(participant.identity)) return
    if (!track.mediaStreamTrack) return

    if (!moderatorMediaStream) {
      moderatorMediaStream = new MediaStream()
    }

    moderatorMediaStream
      .getTracks()
      .filter((existingTrack) => existingTrack.kind === track.kind)
      .forEach((existingTrack) => {
        moderatorMediaStream.removeTrack(existingTrack)
      })

    moderatorMediaStream.addTrack(track.mediaStreamTrack)
    onRemoteModeratorStream?.(moderatorMediaStream)
  }

  function clearModeratorMediaStream() {
    moderatorMediaStream = null
    onRemoteModeratorStream?.(null)
  }

  function handleTrackSubscribed(track, publication, participant) {
    if (participant.isLocal) return

    if (publication?.source === Track.Source.ScreenShare) {
      const key = buildScreenShareKey(participant.identity)
      upsertScreenShareFeed({
        key,
        identity: participant.identity,
        name: participant.name || participant.identity,
        isLocal: false,
      })
      attachScreenShareTrack(key, track)
      syncRemoteParticipants()
      return
    }

    if (publication?.source === Track.Source.ScreenShareAudio) {
      attachAudioTrack(track)
      return
    }

    if (track.kind === Track.Kind.Video) {
      const element = remoteVideoElements.get(participant.identity)
      attachVideoTrack(track, element)
    } else if (track.kind === Track.Kind.Audio) {
      attachAudioTrack(track)
      updateModeratorMediaStream(participant, track, publication)
    }
    syncRemoteParticipants()
  }

  function handleTrackUnsubscribed(track, publication, participant) {
    if (publication?.source === Track.Source.ScreenShare) {
      track.detach()
      removeScreenShareFeed(buildScreenShareKey(participant.identity))
      syncRemoteParticipants()
      return
    }

    track.detach()
    if (isModeratorIdentity(participant.identity) && moderatorMediaStream) {
      const mediaTrack = track.mediaStreamTrack
      if (mediaTrack) {
        moderatorMediaStream.removeTrack(mediaTrack)
      }
      if (moderatorMediaStream.getTracks().length === 0) {
        clearModeratorMediaStream()
      }
    }
    syncRemoteParticipants()
  }

  function handleParticipantConnected(participant) {
    participant.trackPublications.forEach((publication) => {
      if (publication.track) {
        handleTrackSubscribed(publication.track, publication, participant)
      }
    })
    syncRemoteParticipants()

    if (isModeratorIdentity(participant.identity)) {
      onModeratorStatusChange?.(true)
    }
  }

  function handleTrackMuted(_publication, participant) {
    if (participant?.isLocal) {
      syncLocalMediaState()
    }
    syncRemoteParticipants()
  }

  function handleTrackUnmuted(_publication, participant) {
    if (participant?.isLocal) {
      syncLocalMediaState()
    }
    syncRemoteParticipants()
  }

  function handleParticipantDisconnected(participant) {
    removeScreenShareFeed(buildScreenShareKey(participant.identity))
    if (isModeratorIdentity(participant.identity)) {
      onModeratorStatusChange?.(false)
      clearModeratorMediaStream()
    }
    syncRemoteParticipants()
  }

  function setupRoomListeners(lkRoom) {
    lkRoom.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
    lkRoom.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
    lkRoom.on(RoomEvent.ParticipantConnected, handleParticipantConnected)
    lkRoom.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
    lkRoom.on(RoomEvent.TrackMuted, handleTrackMuted)
    lkRoom.on(RoomEvent.TrackUnmuted, handleTrackUnmuted)
    lkRoom.on(RoomEvent.LocalTrackPublished, (publication) => {
      const track = publication.track
      if (!track) return
      if (publication.source === Track.Source.ScreenShare) {
        const key = buildScreenShareKey(userId.value)
        upsertScreenShareFeed({
          key,
          identity: userId.value,
          name: displayName.value || userId.value,
          isLocal: true,
        })
        isSharingScreen.value = true
        attachScreenShareTrack(key, track)
      } else if (track.kind === Track.Kind.Video && localVideoElement.value) {
        attachVideoTrack(track, localVideoElement.value)
      }
    })
    lkRoom.on(RoomEvent.LocalTrackUnpublished, (publication) => {
      if (publication.source === Track.Source.ScreenShare) {
        removeScreenShareFeed(buildScreenShareKey(userId.value))
        isSharingScreen.value = false
      }
    })
    lkRoom.on(RoomEvent.Disconnected, () => {
      isConnected.value = false
    })
  }

  function attachLocalCameraTrack(lkRoom) {
    const camPub = lkRoom.localParticipant.getTrackPublication(
      Track.Source.Camera,
    )
    if (camPub?.track && localVideoElement.value) {
      attachVideoTrack(camPub.track, localVideoElement.value)
    }
  }

  async function enableLocalMedia(lkRoom) {
    if (!navigator.mediaDevices) {
      isCameraEnabled.value = false
      isMicrophoneEnabled.value = false
      return
    }

    try {
      await lkRoom.localParticipant.setCameraEnabled(true)
    } catch (error) {
      isCameraEnabled.value = false
      logMediaDeviceError(error, 'cameraDevice', t)
    }

    try {
      await lkRoom.localParticipant.setMicrophoneEnabled(true)
    } catch (error) {
      isMicrophoneEnabled.value = false
      logMediaDeviceError(error, 'microphoneDevice', t)
    }

    isCameraEnabled.value = lkRoom.localParticipant.isCameraEnabled
    isMicrophoneEnabled.value = lkRoom.localParticipant.isMicrophoneEnabled

    attachLocalCameraTrack(lkRoom)
  }

  async function connect() {
    if (isConnecting.value || isConnected.value) return

    isConnecting.value = true
    connectionError.value = null

    try {
      const { token, url } = await getLiveKitCredentials({
        testId: testId.value,
        userId: userId.value,
        displayName: displayName.value,
        accessLevel: accessLevel.value,
      })

      const lkRoom = new Room()
      setupRoomListeners(lkRoom)

      await lkRoom.connect(url, token)
      room.value = lkRoom
      isConnected.value = true

      await nextTick()
      await enableLocalMedia(lkRoom)

      await startRoomAudio(lkRoom)

      lkRoom.remoteParticipants.forEach((participant) => {
        handleParticipantConnected(participant)
      })
    } catch (error) {
      connectionError.value =
        error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      isConnecting.value = false
    }
  }

  async function disconnect() {
    if (room.value) {
      await room.value.disconnect()
      room.value = null
    }
    isConnected.value = false
    remoteParticipants.value = []
    remoteVideoElements.clear()
    clearScreenShareFeeds()
    clearModeratorMediaStream()
  }

  async function toggleCamera() {
    if (!room.value) return
    const enabled = !room.value.localParticipant.isCameraEnabled
    try {
      await room.value.localParticipant.setCameraEnabled(enabled)
      syncLocalMediaState()
      if (enabled) {
        await nextTick()
        attachLocalCameraTrack(room.value)
      }
    } catch (error) {
      isCameraEnabled.value = false
      logMediaDeviceError(error, 'cameraDevice', t)
    }
  }

  async function toggleMicrophone() {
    if (!room.value) return
    const enabled = !room.value.localParticipant.isMicrophoneEnabled
    try {
      await room.value.localParticipant.setMicrophoneEnabled(enabled)
      syncLocalMediaState()
      await startRoomAudio(room.value)
    } catch (error) {
      isMicrophoneEnabled.value = false
      logMediaDeviceError(error, 'microphoneDevice', t)
    }
  }

  async function toggleScreenShare() {
    if (!room.value || isObservator.value) return
    const enabled = !room.value.localParticipant.isScreenShareEnabled

    if (enabled && !navigator.mediaDevices?.getDisplayMedia) {
      console.warn(getMediaDevicesUnavailableMessage('screenShareDevice', t))
      return
    }

    try {
      await room.value.localParticipant.setScreenShareEnabled(enabled)
      isSharingScreen.value = room.value.localParticipant.isScreenShareEnabled
    } catch (error) {
      isSharingScreen.value = room.value.localParticipant.isScreenShareEnabled
      logMediaDeviceError(error, 'screenShareDevice', t)
    }
  }

  function setRemoteVideoElement(identity, element) {
    const previous = remoteVideoElements.get(identity)
    if (previous === element) return

    if (element) {
      remoteVideoElements.set(identity, element)
    } else {
      remoteVideoElements.delete(identity)
    }

    if (!element || !room.value) return

    nextTick(() => {
      const lkRoom = room.value
      if (!lkRoom) return

      const participant = lkRoom.remoteParticipants.get(identity)
      if (!participant) return

      participant.trackPublications.forEach((publication) => {
        if (!publication.track) return
        if (publication.source === Track.Source.ScreenShare) return
        if (publication.track.kind === Track.Kind.Video) {
          attachVideoTrack(publication.track, element)
        } else if (publication.track.kind === Track.Kind.Audio) {
          attachAudioTrack(publication.track)
        }
      })
    })
  }

  function setScreenShareVideoElement(key, element) {
    const previous = screenShareElements.get(key)
    if (previous === element) return

    if (element) {
      screenShareElements.set(key, element)
    } else {
      screenShareElements.delete(key)
    }

    if (!element || !room.value) return

    nextTick(() => {
      const lkRoom = room.value
      if (!lkRoom) return

      const feed = screenShareFeeds.value.find((item) => item.key === key)
      if (!feed) return

      if (feed.isLocal) {
        const screenPublication = lkRoom.localParticipant.getTrackPublication(
          Track.Source.ScreenShare,
        )
        if (screenPublication?.track) {
          attachVideoTrack(screenPublication.track, element)
        }
        return
      }

      const participant = lkRoom.remoteParticipants.get(feed.identity)
      if (!participant) return

      const screenPublication = participant.getTrackPublication(
        Track.Source.ScreenShare,
      )
      if (screenPublication?.track) {
        attachVideoTrack(screenPublication.track, element)
      }
    })
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    room,
    isConnected,
    isConnecting,
    connectionError,
    callStarted,
    isObservator,
    isCameraEnabled,
    isMicrophoneEnabled,
    isSharingScreen,
    screenShareFeeds,
    remoteParticipants,
    localVideoElement,
    connect,
    disconnect,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
    setRemoteVideoElement,
    setScreenShareVideoElement,
    syncRemoteParticipants,
    getParticipantRole,
  }
}
