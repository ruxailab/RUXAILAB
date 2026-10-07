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

    <div v-if="observerCount" class="fg-observer-indicator">
      <v-icon size="16">mdi-eye-outline</v-icon>
      <span>{{ t('focusGroup.session.observersWatching', { count: observerCount }) }}</span>
    </div>

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
          v-for="tile in visibleGridTiles"
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

      <div
        v-if="pageCount > 1"
        class="fg-video-pagination"
        style="position: absolute; right: 20px; bottom: 20px; z-index: 1000; isolation: isolate; color: #052b47; background: #fff; opacity: 1; filter: none;"
      >
        <span>
          {{
            t('videoCall.session.pageRange', {
              start: pageStart + 1,
              end: pageEnd,
              total: orderedTiles.length,
            })
          }}
        </span>
        <v-btn
          icon="mdi-chevron-left"
          size="x-small"
          variant="outlined"
          style="color: #052b47; background-color: #e6f0f8;"
          :aria-label="t('videoCall.session.previousPage')"
          :disabled="page === 0"
          @click="page -= 1"
        />
        <v-btn
          icon="mdi-chevron-right"
          size="x-small"
          variant="outlined"
          style="color: #052b47; background-color: #e6f0f8;"
          :aria-label="t('videoCall.session.nextPage')"
          :disabled="page >= pageCount - 1"
          @click="page += 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { isObserverAccessLevel } from '@/shared/utils/accessLevel'
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
  recentSpeakerIds: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 4 },
  setLocalVideo: { type: Function, required: true },
  setRemoteVideo: { type: Function, required: true },
  setScreenVideo: { type: Function, required: true },
})

const roleFor = (identity) => props.presenceRoles?.[identity]?.role ?? ''
const isObserver = (identity) =>
  isObserverAccessLevel(props.presenceRoles?.[identity]?.accessLevel)

const observerCount = computed(
  () =>
    Object.values(props.presenceRoles).filter(
      (presence) =>
        presence?.connected === true &&
        isObserverAccessLevel(presence?.accessLevel),
    ).length,
)

// Unified tile list: local camera, remote cameras, then screen shares.
// Mirrors the moderated VideoCallLiveKit tile model.
const tiles = computed(() => {
  const list = []

  if (!props.localState.isObservator) {
    list.push({
      id: 'local-camera',
      type: 'camera',
      kind: 'local',
      identity: props.localState.identity,
      label: `${t('videoCall.session.yourVideo')} (${props.localState.name})`,
      hasCamera: props.localState.isCameraEnabled,
      hasMicrophone: props.localState.isMicrophoneEnabled,
      muted: true,
    })
  }

  props.remoteParticipants.forEach((participant) => {
    // Observers are present and visible in the roster, but have no camera or
    // microphone controls. Showing a permanently muted/off video tile is
    // confusing, so represent them with the observer indicator above instead.
    if (isObserver(participant.identity)) return
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

  const speakerOrder = new Map(
    props.recentSpeakerIds.map((identity, index) => [identity, index]),
  )
  return list.sort((a, b) => {
    if (a.type === 'screen' || b.type === 'screen') {
      return a.type === b.type ? 0 : a.type === 'screen' ? -1 : 1
    }
    return (
      (speakerOrder.get(a.identity) ?? Number.MAX_SAFE_INTEGER) -
      (speakerOrder.get(b.identity) ?? Number.MAX_SAFE_INTEGER)
    )
  })
})

const { focusedTile, isFocusMode, focusTile, clearFocus } = useVideoFocus(tiles)

// Four camera tiles at a time keeps each person legible. Recent speakers are
// ordered first, and the arrows let the group view everyone else.
const page = ref(0)
const pageSize = computed(() => Math.max(1, props.pageSize))
const orderedTiles = computed(() => tiles.value)
const pageCount = computed(() =>
  Math.ceil(orderedTiles.value.length / pageSize.value),
)
const pageStart = computed(() => page.value * pageSize.value)
const pageEnd = computed(() =>
  Math.min(pageStart.value + pageSize.value, orderedTiles.value.length),
)
const pageTiles = computed(() =>
  orderedTiles.value.slice(pageStart.value, pageEnd.value),
)
const visibleGridTiles = computed(() =>
  isFocusMode.value
    ? pageTiles.value.filter((tile) => tile.id !== focusedTile.value?.id)
    : pageTiles.value,
)

watch(pageCount, (count) => {
  if (page.value >= count) page.value = Math.max(0, count - 1)
})
watch(
  () => props.screenShareFeeds.length,
  () => {
    page.value = 0
  },
)

const showWaiting = computed(
  () =>
    !isFocusMode.value &&
    tiles.value.filter((tile) => tile.type === 'camera').length === 0 &&
    props.screenShareFeeds.length === 0,
)

// Grid columns scale with the number of camera tiles (local + remotes).
const cameraCount = computed(
  () => visibleGridTiles.value.filter((tile) => tile.type === 'camera').length,
)

const gridStyleVars = computed(() => {
  const count = cameraCount.value
  const cols = count <= 1 ? 1 : 2
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
  position: relative;
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

.fg-video-stage .videos-grid {
  gap: 12px;
  padding: 12px !important;
}

.fg-observer-indicator {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 5px 10px;
  margin: 8px 12px 0;
  border-radius: 999px;
  color: rgba(var(--v-theme-on-surface), 0.72);
  background: rgba(var(--v-theme-on-surface), 0.06);
  font-size: 0.78rem;
}

.fg-video-pagination {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 4px 12px;
  border: 1px solid rgba(5, 43, 71, 0.2);
  border-radius: 999px;
  color: #052b47 !important;
  background: #fff !important;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.3);
  font-size: 0.78rem;
}

.fg-video-pagination :deep(.v-btn) {
  color: #052b47 !important;
  background: #e6f0f8 !important;
}

.fg-video-pagination :deep(.v-btn:disabled) {
  color: #6c7f8f !important;
  background: #f1f4f6 !important;
  opacity: 1;
}

.fg-video-pagination :deep(.v-btn .v-icon) {
  color: #052b47 !important;
}

.fg-video-stage :deep(.videos-grid .video-container) {
  border-radius: 12px;
  overflow: hidden;
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
