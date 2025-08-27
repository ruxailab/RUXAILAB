import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export function useTestSettings(options = {}) {
  const {
    fetchAction = '',
    updateAction = '',
    deleteAction = '',
    createAction = '',
    getTestByIdGetter = '',
    homeRouteName = '',
    testType = 'test'
  } = options

  const store = useStore()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  // Reactive references
  const loading = ref(false)
  const loadingPage = ref(true)
  const test = ref(null)
  const error = ref(null)
  const dialogDel = ref(false)

  // Computed properties
  const testId = computed(() => route.params.testId)

  const localChanges = computed({
    get: () => store.state.localChanges,
    set: value => store.commit('SET_LOCAL_CHANGES', value),
  })

  const user = computed(() => store.getters.user)

  // Methods
  const fetchTest = async () => {
    if (!testId.value) return

    loading.value = true
    error.value = null

    try {
      if (fetchAction) {
        const testData = await store.dispatch(fetchAction, testId.value)
        test.value = testData
      } else if (getTestByIdGetter) {
        // Alternative: get from store getter
        const fetchedTest = store.getters[getTestByIdGetter](testId.value)
        test.value = fetchedTest
      }

      if (!test.value) {
        error.value = 'Test not found'
        toast.error('Test not found')
      }
    } catch (err) {
      console.error('Error fetching test:', err)
      error.value = 'Failed to load test information'
      toast.error('Failed to load test information')
    } finally {
      loading.value = false
    }
  }

  const markLocalChanges = () => {
    store.commit('SET_LOCAL_CHANGES', true)
  }

  const updateTest = (updates = {}) => {
    if (!test.value) return
    if (typeof updates === 'object' && updates !== null) {
      test.value = { ...test.value, ...updates }
    }
    markLocalChanges()
  }

  const submit = async () => {
    if (!test.value) {
      toast.warning('No test data to save.')
      return
    }

    loading.value = true
    try {
      await store.dispatch(updateAction, {
        testId: test.value.id,
        updates: test.value
      })

      // Refresh the test data
      await fetchTest()

      store.commit('SET_LOCAL_CHANGES', false)
      toast.success('Test settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save test settings.')
      console.error('Error saving test:', error)
    } finally {
      loading.value = false
    }
  }

  const onSubmit = async () => {
    await submit()
    store.commit('SET_LOCAL_CHANGES', false)
    router.push({ name: store.state.pathTo })
  }

  const deleteTest = async (testToDelete) => {
    if (!testToDelete) return

    loading.value = true
    try {
      await store.dispatch(deleteAction, testToDelete.id)
      toast.success('Test deleted successfully!')
      router.push({ name: homeRouteName })
    } catch (error) {
      toast.error('Failed to delete test.')
      console.error('Error deleting test:', error)
    } finally {
      loading.value = false
      dialogDel.value = false
    }
  }

  const duplicateTest = async () => {
    if (!test.value) return

    loading.value = true
    try {
      const duplicatedTest = {
        ...test.value,
        id: null,
        title: `Copy of ${test.value.title}`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await store.dispatch(createAction, duplicatedTest)
      toast.success('Test duplicated successfully!')
      router.push({ name: homeRouteName })
    } catch (error) {
      toast.error('Failed to duplicate test.')
      console.error('Error duplicating test:', error)
    } finally {
      loading.value = false
    }
  }

  const exportTest = async () => {
    if (!test.value) return

    try {
      const exportData = {
        ...test.value,
        exportedAt: new Date().toISOString(),
        exportedBy: user.value?.email || 'Unknown'
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${testType}-test-${test.value.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Test exported successfully!')
    } catch (error) {
      toast.error('Failed to export test.')
      console.error('Error exporting test:', error)
    }
  }

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      'draft': 'orange',
      'active': 'green',
      'completed': 'blue',
      'failed': 'red',
      'in-progress': 'warning',
      'archived': 'error'
    }
    return colors[status?.toLowerCase()] || 'grey'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'draft': 'mdi-file-document-edit',
      'active': 'mdi-play-circle',
      'completed': 'mdi-check-circle',
      'failed': 'mdi-alert-circle',
      'in-progress': 'mdi-clock',
      'archived': 'mdi-archive'
    }
    return icons[status?.toLowerCase()] || 'mdi-help-circle'
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    
    let date
    if (timestamp.seconds) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000)
    } else {
      // Regular date
      date = new Date(timestamp)
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Lifecycle hooks
  const preventNav = (event) => {
    if (!localChanges.value) return
    event.preventDefault()
    event.returnValue = ''
  }

  onBeforeMount(() => {
    store.commit('SET_LOCAL_CHANGES', false)
    store.commit('SET_DIALOG_LEAVE', false)
    window.addEventListener('beforeunload', preventNav)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', preventNav)
  })

  onBeforeRouteLeave((to, from) => {
    if (localChanges.value) {
      store.commit('SET_DIALOG_LEAVE', true)
      store.commit('SET_PATH_TO', to.name)
      return false
    }
    return true
  })

  return {
    // State
    loading,
    loadingPage,
    test,
    error,
    dialogDel,
    testId,
    localChanges,
    user,

    // Methods
    fetchTest,
    markLocalChanges,
    updateTest,
    submit,
    onSubmit,
    deleteTest,
    duplicateTest,
    exportTest,

    // Helpers
    getStatusColor,
    getStatusIcon,
    formatDate
  }
}
