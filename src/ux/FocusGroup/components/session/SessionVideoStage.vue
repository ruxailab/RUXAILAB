<template>
  <div class="fg-video-stage">
    <v-alert
      v-if="connectionError"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mb-3"
      closable
    >
      {{ connectionError }}
    </v-alert>

    <div class="video-stage">
      <!-- Spotlight: focused participant or shared screen (click to release) -->
      <div v-if="isFocusMode" class="spotlight-primary">
        <div
          :key="focusedTile.id"
          class="spotlight-item tile-clickable"
          @click="clearFocus"
        >
          <div
            class="video-container"
            :class="{ 'screen-share-container': focusedTile.type === 'screen' }"
          >
            <video
              :ref="(el) => attachTileRef(focusedTile, el)"
              autoplay
              playsinline
              :muted="focusedTile.muted"
              class="video-element"
              :class="{ 'screen-share-element': focusedTile.type === 'screen' }"
            ></video>

            <div
              v-if="focusedTile.type === 'camera' && !focusedTile.hasCamera"
              class="camera-disabled-overlay"
            >
              <v-icon size="64" color="white" class="mb-2">mdi-video-off</v-icon>
              <p class="text-white">{{ t('videoCall.session.cameraOff') }}</p>
            </div>

            <div
              v-if="focusedTile.type === 'camera' && !focusedTile.hasMicrophone"
              class="mic-muted-indicator"
            >
              <v-icon size="24" color="white">mdi-microphone-off</v-icon>
            </div>

            <div class="video-label">{{ focusedTile.label }}</div>
          </div>
        </div>
      </div>

      <!-- Tiles: full grid, or a compact filmstrip while spotlighting -->
      <div
        class="videos-grid"
        :class="{ 'videos-filmstrip': isFocusMode }"
        :style="gridStyleVars"
      >
        <div
          v-for="tile in isFocusMode ? otherTiles : tiles"
          :key="tile.id"
          class="video-wrapper tile-clickable"
          @click="focusTile(tile.id)"
        >
          <div
            class="video-container"
            :class="{ 'screen-share-container': tile.type === 'screen' }"
          >
            <video
              :ref="(el) => attachTileRef(tile, el)"
              autoplay
              playsinline
              :muted="tile.muted"
              class="video-element"
              :class="{ 'screen-share-element': tile.type === 'screen' }"
            ></video>

            <div
              v-if="tile.type === 'camera' && !tile.hasCamera"
              class="camera-disabled-overlay"
            >
              <v-icon size="64" color="white" class="mb-2">mdi-video-off</v-icon>
              <p class="text-white">{{ t('videoCall.session.cameraOff') }}</p>
            </div>

            <div
              v-if="tile.type === 'camera' && !tile.hasMicrophone"
              class="mic-muted-indicator"
            >
              <v-icon size="24" color="white">mdi-microphone-off</v-icon>
            </div>

            <div class="video-label">{{ tile.label }}</div>
          </div>
        </div>

        <!-- Waiting message when no peers have joined yet -->
        <div
          v-if="showWaiting"
          class="d-flex align-center justify-center pa-4 text-grey"
        >
          <v-icon class="me-2">mdi-account-clock</v-icon>
          <span>{{ t('videoCall.session.waitingForParticipants') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVideoFocus } from '@/shared/components/videoCall/composables/useVideoFocus'

const { t } = useI18n()

const props = defineProps({
  remoteParticipants: { type: Array, default: () => [] },
  screenShareFeeds: { type: Array, default: () => [] },
  localState: { type: Object, required: true },
  connectionError: { type: String, default: null },
  // FG presence map (identity -> { role }), used for tile role labels because
  // the facilitator is the testAdmin and so is absent from cooperators.
  presenceRoles: { type: Object, default: () => ({}) },
  setLocalVideo: { type: Function, required: true },
  setRemoteVideo: { type: Function, required: true },
  setScreenVideo: { type: Function, required: true },
})

const roleFor = (identity) => props.presenceRoles?.[identity]?.role ?? ''

// Unified tile list: local camera, remote cameras, then screen shares.
// Mirrors the moderated VideoCallLiveKit tile model.
const tiles = computed(() => {
  const list = []

  if (!props.localState.isObservator) {
    list.push({
      id: 'local-camera',
      type: 'camera',
      kind: 'local',
      label: `${t('videoCall.session.yourVideo')} (${props.localState.name})`,
      hasCamera: props.localState.isCameraEnabled,
      hasMicrophone: props.localState.isMicrophoneEnabled,
      muted: true,
    })
  }

  props.remoteParticipants.forEach((participant) => {
    const role = roleFor(participant.identity)
    list.push({
      id: `camera:${participant.identity}`,
      type: 'camera',
      kind: 'remote',
      identity: participant.identity,
      label: role ? `${participant.name} · ${role}` : participant.name,
      hasCamera: participant.hasCamera,
      hasMicrophone: participant.hasMicrophone,
      muted: false,
    })
  })

  props.screenShareFeeds.forEach((feed) => {
    list.push({
      id: `screen:${feed.key}`,
      type: 'screen',
      feedKey: feed.key,
      label: `${t('videoCall.session.screenSharingLabel')} (${feed.name})`,
      muted: !!feed.isLocal,
    })
  })

  return list
})

// Spotlight/filmstrip behaviour, shared with the moderated call: click a tile to
// enlarge it; a new screen share auto-grabs the spotlight (stimulus presentation).
const { focusedTile, otherTiles, isFocusMode, focusTile, clearFocus } =
  useVideoFocus(tiles)

const showWaiting = computed(
  () =>
    !isFocusMode.value &&
    props.remoteParticipants.length === 0 &&
    props.screenShareFeeds.length === 0,
)

// Grid columns scale with the number of camera tiles (local + remotes).
const cameraCount = computed(
  () =>
    (props.localState.isObservator ? 0 : 1) + props.remoteParticipants.length,
)

const gridStyleVars = computed(() => {
  const count = cameraCount.value
  const cols = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4
  return { '--grid-cols': cols }
})

// Routes a video element to the correct LiveKit attach helper. Null (unmount)
// is ignored so a re-mount in another slot doesn't clobber the active element.
function attachTileRef(tile, el) {
  if (!el || !tile) return
  if (tile.type === 'screen') {
    props.setScreenVideo(tile.feedKey, el)
  } else if (tile.kind === 'local') {
    props.setLocalVideo(el)
  } else {
    props.setRemoteVideo(tile.identity, el)
  }
}
</script>

<!-- Reuse the moderated call's tile/spotlight styling verbatim. -->
<style scoped src="@/shared/components/videoCall/videoCallShared.css"></style>

<!-- FG sizing: the stage fills the main area of the live-session layout, so the
     video grid grows and shrinks with the available space (and with the number
     of participants) rather than being capped to a fixed height. -->
<style scoped>
.fg-video-stage {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.fg-video-stage .video-stage {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
  height: 100%;
  overflow-y: auto;
}

/* The shared grid centres rows with a fixed 4:3 tile size, which clips the
   top/bottom rows once tiles no longer fit the available height (a CSS
   "unsafe centering" overflow that can't be scrolled back into view). Instead,
   let rows share the stage's height evenly like Google Meet does — tiles
   shrink as more people join rather than overflowing, and object-fit: contain
   on the <video> keeps every stream fully visible, uncropped. */
.fg-video-stage .videos-grid:not(.videos-single):not(.videos-filmstrip) {
  height: 100%;
  grid-auto-rows: minmax(0, 1fr);
  align-content: stretch;
  justify-content: stretch;
  align-items: stretch;
}

.fg-video-stage .videos-grid:not(.videos-single) .video-container {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
}

/* Pinned participant/screen share gets the flexible stage; the remaining
   tiles form a scrollable filmstrip. These explicit flex constraints are
   important in the fixed-height call shell: without them the video element's
   intrinsic 4:3 size can overflow instead of shrinking with its container. */
.fg-video-stage .spotlight-primary {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  align-items: stretch;
}

.fg-video-stage .spotlight-item,
.fg-video-stage .spotlight-item .video-container {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  aspect-ratio: auto;
}

.fg-video-stage .videos-grid.videos-filmstrip {
  flex: 0 0 clamp(140px, 22%, 240px);
  width: auto;
  height: 100%;
  min-width: 0;
  overflow: auto;
  grid-template-columns: minmax(0, 1fr);
  grid-auto-rows: minmax(96px, 1fr);
  align-content: start;
  justify-content: stretch;
}

.fg-video-stage .videos-filmstrip .video-wrapper {
  min-width: 0;
  min-height: 0;
}

.fg-video-stage .tile-clickable {
  cursor: pointer;
}

.fg-video-stage .video-element {
  object-fit: cover;
}

/* In prompt-presentation mode the call occupies a narrow right rail. Keep
   the selected tile dominant within that rail and stack the other attendees
   below it rather than squeezing a multi-column grid into a narrow width. */
.fg-video-rail .video-stage {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fg-video-rail .spotlight-primary {
  flex: 0 0 min(42%, 280px);
}

.fg-video-rail .videos-grid:not(.videos-filmstrip) {
  grid-template-columns: minmax(0, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
  height: auto;
  overflow: auto;
}

.fg-video-rail .videos-grid.videos-filmstrip {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  grid-auto-rows: minmax(96px, 1fr);
}

@media (max-width: 800px) {
  .fg-video-stage .videos-grid.videos-filmstrip {
    flex-basis: clamp(92px, 25vw, 160px);
    grid-auto-rows: minmax(84px, 1fr);
  }

  .fg-video-rail .spotlight-primary {
    flex-basis: 45%;
  }
}
</style>
