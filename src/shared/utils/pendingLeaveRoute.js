export const clearPendingLeaveRoute = (store) => {
  store.commit('SET_DIALOG_LEAVE', false)
  store.commit('SET_PATH_TO', null)
}

export const capturePendingLeaveRoute = (store, to) => {
  store.commit('SET_DIALOG_LEAVE', true)
  store.commit('SET_PATH_TO', to.fullPath)
}

export const navigateToPendingLeaveRoute = async (store, router) => {
  const targetRoute = store.state.pathTo

  clearPendingLeaveRoute(store)

  if (!targetRoute) {
    return false
  }

  await router.push(targetRoute).catch(() => {})
  return true
}
