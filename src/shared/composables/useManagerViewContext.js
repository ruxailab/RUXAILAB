import {
  ACCESS_LEVEL,
  resolveManagerAccessLevel,
} from '@/shared/utils/accessLevel'
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export const useManagerViewContext = ({
  publicAccessLevel = ACCESS_LEVEL.EVALUATOR,
  privateAccessLevel = ACCESS_LEVEL.GUEST,
  hasAccess,
} = {}) => {
  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  const user = computed(() => store.getters.user)
  const test = computed(() => store.getters.test)

  const accessLevel = computed(() => {
    return resolveManagerAccessLevel({
      currentUser: user.value,
      currentTest: test.value,
      publicAccessLevel,
      privateAccessLevel,
    })
  })

  watchEffect(() => {
    if (user.value != null && test.value != null) {
      const allowed = hasAccess
        ? hasAccess(accessLevel.value)
        : accessLevel.value !== null

      if (!allowed) {
        router.push('/')
      }
    }
  })

  onMounted(async () => {
    await store.dispatch('getStudy', { id: route.params.id })
    await store.dispatch('getCurrentTestAnswerDoc')
  })

  return {
    store,
    route,
    router,
    user,
    test,
    accessLevel,
  }
}