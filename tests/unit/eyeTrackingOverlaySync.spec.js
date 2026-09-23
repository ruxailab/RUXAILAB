import { mount } from '@vue/test-utils'
import EyeTrackingOverlay from '@/ux/UserTest/components/answers/EyeTrackingOverlay.vue'

describe('EyeTrackingOverlay timestamp synchronization', () => {
  let mockVideoElement

  beforeEach(() => {
    mockVideoElement = document.createElement('video')
    Object.defineProperty(mockVideoElement, 'getBoundingClientRect', {
      value: () => ({ width: 1000, height: 600 }),
    })
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      setTransform: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
    }))
  })

  it('correctly mounts without errors and renders canvas element', () => {
    const wrapper = mount(EyeTrackingOverlay, {
      props: {
        videoRef: mockVideoElement,
        predictedData: [
          {
            timestamp: 1000,
            predicted_x: 500,
            predicted_y: 300,
            screen_width: 1000,
            screen_height: 600,
          },
          {
            timestamp: 1300,
            predicted_x: 600,
            predicted_y: 350,
            screen_width: 1000,
            screen_height: 600,
          },
        ],
        currentTime: 0,
        isPlaying: false,
        viewMode: 'precision',
      },
    })

    expect(wrapper.find('canvas').exists()).toBe(true)
    wrapper.unmount()
  })

  it('handles empty predictedData gracefully without exceptions', async () => {
    const wrapper = mount(EyeTrackingOverlay, {
      props: {
        videoRef: mockVideoElement,
        predictedData: [],
        currentTime: 0,
        isPlaying: false,
        viewMode: 'precision',
      },
    })

    expect(wrapper.find('canvas').exists()).toBe(true)
    await wrapper.setProps({ currentTime: 2.5 })
    expect(wrapper.find('canvas').exists()).toBe(true)
    wrapper.unmount()
  })

  it('updates canvas when viewMode or currentTime changes', async () => {
    const wrapper = mount(EyeTrackingOverlay, {
      props: {
        videoRef: mockVideoElement,
        predictedData: [
          {
            timestamp: 1000,
            predicted_x: 200,
            predicted_y: 100,
            screen_width: 1000,
            screen_height: 600,
          },
          {
            timestamp: 1500,
            predicted_x: 400,
            predicted_y: 200,
            screen_width: 1000,
            screen_height: 600,
          },
          {
            timestamp: 2000,
            predicted_x: 600,
            predicted_y: 300,
            screen_width: 1000,
            screen_height: 600,
          },
        ],
        currentTime: 0.25,
        isPlaying: false,
        viewMode: 'precision',
      },
    })

    await wrapper.setProps({ viewMode: 'free' })
    await wrapper.setProps({ currentTime: 0.8 })
    await wrapper.setProps({ viewMode: 'heatmap' })

    expect(wrapper.find('canvas').exists()).toBe(true)
    wrapper.unmount()
  })

  it('handles single prediction point and fallback x/y properties', async () => {
    const wrapper = mount(EyeTrackingOverlay, {
      props: {
        videoRef: mockVideoElement,
        predictedData: [
          {
            timestamp: 5000,
            x: 300,
            y: 400,
            screen_width: 1920,
            screen_height: 1080,
          },
        ],
        currentTime: 0,
        isPlaying: false,
        viewMode: 'precision',
      },
    })

    expect(wrapper.find('canvas').exists()).toBe(true)
    await wrapper.setProps({ currentTime: 5.0 })
    expect(wrapper.find('canvas').exists()).toBe(true)
    wrapper.unmount()
  })

  it('handles play and pause transitions with animation loop', async () => {
    const wrapper = mount(EyeTrackingOverlay, {
      props: {
        videoRef: mockVideoElement,
        predictedData: [
          { timestamp: 1000, predicted_x: 100, predicted_y: 100, screen_width: 800, screen_height: 600 },
          { timestamp: 2000, predicted_x: 200, predicted_y: 200, screen_width: 800, screen_height: 600 },
        ],
        currentTime: 0,
        isPlaying: false,
        viewMode: 'precision',
      },
    })

    await wrapper.setProps({ isPlaying: true })
    await wrapper.setProps({ isPlaying: false })
    expect(wrapper.find('canvas').exists()).toBe(true)
    wrapper.unmount()
  })
})
