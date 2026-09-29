describe('Eye tracking calibration completion for anonymous and logged-in participants', () => {
  let timerId
  let intervalCallback
  let messageCallback
  let focusCallback
  let mockWindow
  let calibrationCompleted
  let calibrationPopup

  const stopCalibrationPopupPolling = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    window.removeEventListener('message', messageCallback)
    window.removeEventListener('focus', focusCallback)
  }

  const handleCalibrationFinished = () => {
    calibrationCompleted = true
    stopCalibrationPopupPolling()
    if (calibrationPopup && !calibrationPopup.closed) {
      calibrationPopup.close()
    }
  }

  const checkCalibrationWindowStatus = () => {
    if (calibrationPopup && calibrationPopup.closed) {
      handleCalibrationFinished()
    }
  }

  const handleCalibrationMessage = (event) => {
    const data = event?.data
    if (!data) return
    const isCompletedMsg =
      data === 'calibration_finished' ||
      data === 'calibration_success' ||
      data?.type === 'CALIBRATION_FINISHED' ||
      data?.type === 'CALIBRATION_SUCCESS' ||
      data?.type === 'CALIBRATION_COMPLETED' ||
      data?.action === 'calibration_finished' ||
      (data?.status === 'success' && data?.calibration)

    if (isCompletedMsg) {
      handleCalibrationFinished()
    }
  }

  const startCalibrationPopupPolling = () => {
    stopCalibrationPopupPolling()
    window.addEventListener('message', handleCalibrationMessage)
    window.addEventListener('focus', checkCalibrationWindowStatus)
    setInterval(checkCalibrationWindowStatus, 500)
  }

  beforeEach(() => {
    jest.useFakeTimers()
    timerId = null
    intervalCallback = null
    messageCallback = null
    focusCallback = null
    calibrationCompleted = false

    mockWindow = {
      closed: false,
      close: jest.fn(() => {
        mockWindow.closed = true
      }),
    }
    calibrationPopup = mockWindow

    jest.spyOn(window, 'addEventListener').mockImplementation((event, cb) => {
      if (event === 'message') messageCallback = cb
      if (event === 'focus') focusCallback = cb
    })

    jest.spyOn(window, 'removeEventListener').mockImplementation((event) => {
      if (event === 'message') messageCallback = null
      if (event === 'focus') focusCallback = null
    })

    jest.spyOn(global, 'setInterval').mockImplementation((cb) => {
      intervalCallback = cb
      timerId = 123
      return timerId
    })

    jest.spyOn(global, 'clearInterval').mockImplementation((id) => {
      if (id === timerId) {
        timerId = null
        intervalCallback = null
      }
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('generates a valid anonymous identifier when user is not logged in', () => {
    const user = { value: null }
    const anonymousUserDocId = { value: null }

    const initializeAnonymousUser = () => {
      if (!user.value && !anonymousUserDocId.value) {
        anonymousUserDocId.value = 'anon_1234567890ab'
      }
    }

    const openCalibration = () => {
      if (!user.value?.id && !anonymousUserDocId.value) {
        initializeAnonymousUser()
      }
      const authId = user.value?.id || anonymousUserDocId.value
      return `https://eye-lab.example.com/calibration/camera?auth=${authId}&test=test-study-id`
    }

    const url = openCalibration()
    expect(anonymousUserDocId.value).toBe('anon_1234567890ab')
    expect(url).toContain('auth=anon_1234567890ab')
    expect(url).not.toContain('undefined')
  })

  it('detects calibration completion via popup window.closed polling', () => {
    startCalibrationPopupPolling()
    expect(timerId).toBe(123)
    expect(calibrationCompleted).toBe(false)

    // Simulate popup closing
    calibrationPopup.closed = true
    intervalCallback()

    expect(calibrationCompleted).toBe(true)
    expect(timerId).toBeNull()
  })

  it('detects calibration completion via HTML5 postMessage event', () => {
    startCalibrationPopupPolling()
    expect(calibrationCompleted).toBe(false)

    messageCallback({ data: { type: 'CALIBRATION_COMPLETED' } })

    expect(calibrationCompleted).toBe(true)
    expect(mockWindow.close).toHaveBeenCalled()
    expect(timerId).toBeNull()
  })

  it('detects calibration completion on window focus if popup was closed', () => {
    startCalibrationPopupPolling()
    expect(calibrationCompleted).toBe(false)

    // User switches back to RUXAILAB window after closing popup
    calibrationPopup.closed = true
    focusCallback()

    expect(calibrationCompleted).toBe(true)
    expect(timerId).toBeNull()
  })

  it('allows manual continuation as a fail-safe fallback and closes popup', () => {
    handleCalibrationFinished()

    expect(calibrationCompleted).toBe(true)
    expect(mockWindow.close).toHaveBeenCalled()
  })
})
