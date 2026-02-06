import {
  ref,
  computed,
  watch,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
} from 'vue'
import { useStore } from 'vuex'
import {
  useRouter,
  useRoute,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
} from 'vue-router'
import { showSuccess, showError, showWarning } from '../utils/toast'

/**
 * Composable for shared accessibility test settings functionality
 * Handles common operations like template creation, test deletion, form validation, etc.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.storeModule - Vuex store module name ('manualAccessibility' or 'automaticAccessibility')
 * @param {string} config.testListRoute - Route name for test list navigation
 * @param {Function} config.createTestInstance - Function to create test instance for duplication
 * @param {string} config.testType - Test type identifier ('MANUAL_ACCESSIBILITY' or 'AUTOMATIC_ACCESSIBILITY')
 * @param {Object} config.defaultObject - Default object structure for the test
 */
export function useAccessibilityTestSettings(config) {
  const store = useStore()
  const router = useRouter()
  const route = useRoute()

  // Reactive state
  const template = ref({
    templateTitle: '',
    templateDescription: '',
    isTemplatePublic: false,
  })

  const object = ref(config.defaultObject || {})
  const valids = ref([false, true, true])
  const dialogDel = ref(false)
  const loading = ref(false)
  const loadingPage = ref(true)
  const tempDialog = ref(false)
  const form1 = ref(null)
  const tempform = ref(null)

  // Common options
  const statusOptions = [
    { title: 'Draft', value: 'draft' },
    { title: 'In Progress', value: 'in-progress' },
    { title: 'Completed', value: 'completed' },
    { title: 'Archived', value: 'archived' },
  ]

  const titleRequired = [
    (v) => !!v.trim() || 'Field is required',
    (v) => v.length <= 200 || 'Max 200 characters',
  ]

  // Computed properties
  const localChanges = computed({
    get: () => store.state.localChanges,
    set: (value) => store.commit('SET_LOCAL_CHANGES', value),
  })

  const user = computed(() => store.getters.user)

  const dialogText = computed(() => {
    if (object.value && (object.value.title || object.value.testTitle)) {
      return `Are you sure you want to delete your test "${
        object.value.title || object.value.testTitle
      }"?`
    }
    return 'Are you sure you want to delete this test?'
  })

  const hasTemplate = computed(() => {
    if (object.value && 'template' in object.value) {
      return object.value.template !== null
    }
    return false
  })

  // Manual accessibility specific computed
  const currentTest = computed(() => {
    if (config.storeModule === 'manualAccessibility') {
      return store.getters['manualAccessibility/getCurrentTest']
    }
    return null
  })

  // Watch for currentTest changes (manual accessibility only)
  watch(
    currentTest,
    (newTest) => {
      if (
        config.storeModule === 'manualAccessibility' &&
        newTest &&
        !object.value?.id
      ) {
        object.value = {
          id: newTest.id || null,
          title: newTest.title || '',
          testTitle: newTest.title || '',
          description: newTest.description || '',
          testDescription: newTest.description || '',
          websiteUrl: newTest.websiteUrl || '',
          testType: config.testType,
          status: newTest.status || 'draft',
          isPublic: newTest.isPublic || false,
          configData: newTest.configData || {
            complianceLevel: 'AA',
            includeNonInterference: true,
          },
          testAdmin: newTest.testAdmin || null,
          createdAt: newTest.createdAt || null,
          updatedAt: newTest.updatedAt || null,
        }
      }
    },
    { immediate: true },
  )

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusColor = (status) => {
    const statusColors = {
      draft: 'grey',
      'in-progress': 'orange',
      completed: 'success',
      archived: 'error',
    }
    return statusColors[status?.toLowerCase()] || 'secondary'
  }

  // Core functionality
  const fetchTest = async () => {
    if (!route.params.testId) return

    loadingPage.value = true

    try {
      let testData
      if (config.storeModule === 'manualAccessibility') {
        testData = await store.dispatch(
          `${config.storeModule}/fetchTest`,
          route.params.testId,
        )
        if (testData) {
          // Map the fetched data to match FormTestDescription expectations
          object.value = {
            ...config.defaultObject, // Start with defaults
            ...testData, // Override with actual data
            testTitle: testData.title || '',
            testDescription: testData.description || '',
            testType: config.testType,
            status: testData.status || 'draft',
            websiteUrl: testData.websiteUrl || '',
            isPublic: testData.isPublic || false,
          }
        }
      } else {
        // For automatic accessibility, fetch from store
        if (!store.getters[`${config.storeModule}/allTests`]?.length) {
          await store.dispatch(`${config.storeModule}/fetchTests`)
        }
        testData = store.getters[`${config.storeModule}/getTestById`](
          route.params.testId,
        )

        if (testData) {
          // Map the fetched data to match FormTestDescription expectations
          object.value = {
            ...config.defaultObject, // Start with defaults
            ...testData, // Override with actual data
            testTitle: testData.title || '',
            testDescription: testData.description || '',
            testType: config.testType,
            status: testData.status || 'draft',
            websiteUrl: testData.websiteUrl || '',
            isPublic: testData.isPublic || false,
          }
        } else {
          showError('Test not found')
          object.value = {
            ...config.defaultObject,
            testType: config.testType,
          }
        }
      }
    } catch (err) {
      showError('Failed to load test information')
      object.value = {
        ...config.defaultObject,
        testType: config.testType,
      }
    } finally {
      loadingPage.value = false
    }
  }

  const validate = (valid, index) => {
    valids.value[index] = valid
  }

  const onSubmit = async () => {
    await submit()
    store.commit('SET_LOCAL_CHANGES', false)
    router.push({ name: store.state.pathTo })
  }

  const submit = async () => {
    if (!object.value) {
      showError('No test data available')
      return
    }

    const title = object.value.title || object.value.testTitle
    if (title && title.length > 0 && title.length < 200) {
      loading.value = true
      try {
        // Prepare the update object with the correct property mapping
        const updateData = {
          ...object.value,
          title: title,
          description: object.value.description || object.value.testDescription,
        }

        // Use the same action pattern for both modules
        await store.dispatch(`${config.storeModule}/updateTest`, {
          testId: route.params.testId,
          updates: updateData,
        })

        await fetchTest() // Refresh the test data
        store.commit('SET_LOCAL_CHANGES', false)
        showSuccess('Changes saved successfully')
      } catch (error) {
        showError('Failed to save changes.')
      } finally {
        loading.value = false
      }
    } else if (title && title.length >= 200) {
      showWarning('Title must not exceed 200 characters.')
    } else {
      showWarning('Test must contain a title.')
    }
  }

  const preventNav = (event) => {
    if (!localChanges.value) return
    event.preventDefault()
    event.returnValue = ''
  }

  const deleteTest = async (item) => {
    if (!item?.id) {
      showError('No test data available for deletion')
      return
    }

    loading.value = true
    try {
      if (config.storeModule === 'manualAccessibility') {
        await store.dispatch(`${config.storeModule}/deleteTest`, item.id)
      } else {
        await store.dispatch(`${config.storeModule}/removeTest`, item.id)
      }

      showSuccess('Test deleted successfully!')
      router.push({ name: config.testListRoute })
    } catch {
      showError('Failed to delete test.')
    } finally {
      loading.value = false
      dialogDel.value = false
    }
  }

  const createTemplate = async () => {
    const { valid } = await tempform.value.validate()
    if (!valid) {
      showWarning('Please fill in the required fields.')
      return
    }

    loading.value = true
    try {
      // Create template logic here (implement based on your template system)
      showSuccess('Template created successfully!')
      closeDialog()
    } catch {
      showError('Failed to create template.')
    } finally {
      loading.value = false
    }
  }

  const closeDialog = () => {
    tempDialog.value = false
    if (tempform.value) {
      tempform.value.resetValidation()
    }
    template.value = {
      templateTitle: '',
      templateDescription: '',
      isTemplatePublic: false,
    }
  }

  const updateTemplate = (updates) => {
    template.value = { ...template.value, ...updates }
  }

  const updateObject = (newObject) => {
    if (!newObject) return

    // Map FormTestDescription properties back to test properties
    const mappedObject = {
      ...newObject,
      title: newObject.testTitle || newObject.title,
      description: newObject.testDescription || newObject.description,
    }
    object.value = { ...object.value, ...mappedObject }
    store.commit('SET_LOCAL_CHANGES', true)
  }

  const updateWebsiteUrl = (value) => {
    if (!object.value) return
    object.value = { ...object.value, websiteUrl: value || '' }
    store.commit('SET_LOCAL_CHANGES', true)
  }

  const duplicateTest = async () => {
    if (!object.value) {
      showError('No test data available for duplication')
      return
    }

    loading.value = true
    try {
      const testObj = config.createTestInstance({
        title:
          'Copy of ' +
          (object.value.title || object.value.testTitle || 'Untitled Test'),
        description:
          object.value.description || object.value.testDescription || '',
        websiteUrl: object.value.websiteUrl || '',
        testAdmin: object.value.testAdmin,
        status: 'draft',
        isPublic: false,
        id: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...object.value, // Include other specific properties
      })

      if (config.storeModule === 'manualAccessibility') {
        await store.dispatch(`${config.storeModule}/createTest`, testObj)
      } else {
        await store.dispatch(`${config.storeModule}/addTest`, testObj)
      }

      showSuccess('Test duplicated successfully!')
      router.push({ name: config.testListRoute })
    } catch {
      showError('Failed to duplicate test.')
    } finally {
      loading.value = false
    }
  }

  // Lifecycle hooks
  onMounted(async () => {
    if (route.params.testId) {
      await fetchTest()
    }
  })

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

  // Watch for route changes to fetch new test data
  onBeforeRouteUpdate(async (to, from, next) => {
    if (to.params.testId !== from.params.testId) {
      await fetchTest()
    }
    next()
  })

  return {
    // Reactive state
    template,
    object,
    valids,
    dialogDel,
    loading,
    loadingPage,
    tempDialog,
    form1,
    tempform,

    // Options
    statusOptions,
    titleRequired,

    // Computed
    localChanges,
    user,
    dialogText,
    hasTemplate,
    currentTest,

    // Methods
    formatDate,
    getStatusColor,
    fetchTest,
    validate,
    onSubmit,
    submit,
    deleteTest,
    createTemplate,
    closeDialog,
    updateTemplate,
    updateObject,
    updateWebsiteUrl,
    duplicateTest,
  }
}
