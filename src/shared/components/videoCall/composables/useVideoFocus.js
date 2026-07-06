import { ref, computed, watch } from 'vue'

/**
 * Manages the spotlight/focus behaviour for the video call tiles.
 *
 * - Any tile (participant camera or screen share) can be focused by clicking it.
 * - When a new screen share starts, it automatically takes the focus.
 * - When the focused tile disappears, focus falls back to the latest screen
 *   share (if any) or to the plain grid layout.
 *
 * @param {import('vue').ComputedRef<Array>} tiles reactive list of tiles,
 *   each shaped as { id, type: 'camera' | 'screen', ... }.
 */
export function useVideoFocus(tiles) {
  const focusedTileId = ref(null)

  const screenTileIds = computed(() =>
    tiles.value
      .filter((tile) => tile.type === 'screen')
      .map((tile) => tile.id),
  )

  // A new screen share always grabs the spotlight
  watch(screenTileIds, (ids, previous = []) => {
    const added = ids.find((id) => !previous.includes(id))
    if (added) focusedTileId.value = added
  })

  const focusedTile = computed(() => {
    const manual = tiles.value.find((tile) => tile.id === focusedTileId.value)
    if (manual) return manual

    const screens = tiles.value.filter((tile) => tile.type === 'screen')
    if (screens.length) return screens[screens.length - 1]

    return null
  })

  const isFocusMode = computed(() => !!focusedTile.value)

  const otherTiles = computed(() => {
    const focusId = focusedTile.value?.id
    return tiles.value.filter((tile) => tile.id !== focusId)
  })

  function focusTile(id) {
    focusedTileId.value = id
  }

  function clearFocus() {
    focusedTileId.value = null
  }

  return {
    focusedTile,
    otherTiles,
    isFocusMode,
    focusTile,
    clearFocus,
  }
}
