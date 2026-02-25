import { useRouter } from 'vue-router'

export function useGoBack() {
  const router = useRouter()

  const goBackOrRedirect = (fallbackRoute = '/') => {
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      router.push(fallbackRoute)
    }
  }

  return {
    goBackOrRedirect
  }
}
