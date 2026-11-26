import { mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import UploadProgressDialog from '@/shared/components/UploadProgressDialog.vue'

const mockUploads = {
  uploads: [],
  online: null,
  retryUpload: jest.fn(),
  cancelUpload: jest.fn(),
}
jest.mock('@/shared/services/uploadManager', () => ({
  useUploads: () => mockUploads,
}))

const MB = 1024 * 1024
const recording = {
  id: 1,
  label: 'Screen recording',
  replaceable: false,
  bytesTransferred: MB,
  totalBytes: 4 * MB,
  status: 'uploading',
}

const mountDialog = (uploads, { online = true } = {}) => {
  mockUploads.uploads = reactive(uploads)
  mockUploads.online = ref(online)
  return mount(UploadProgressDialog, {
    global: {
      mocks: {
        $t: (key, params) =>
          params === undefined ? key : `${key}:${JSON.stringify(params)}`,
      },
      stubs: {
        'v-dialog': {
          props: ['modelValue'],
          template: '<div v-if="modelValue" class="dialog-stub"><slot /></div>',
        },
        'v-card': { template: '<div><slot /></div>' },
        'v-alert': { template: '<div class="alert-stub"><slot /></div>' },
        'v-progress-linear': {
          props: ['modelValue', 'color'],
          template:
            '<div class="progress-stub" :data-value="modelValue" :data-color="color" />',
        },
        'v-btn': {
          emits: ['click'],
          template:
            '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })
}

const button = (wrapper, key) =>
  wrapper.findAll('button').find((item) => item.text() === key)

describe('UploadProgressDialog', () => {
  it('stays closed while nothing is uploading', () => {
    const wrapper = mountDialog([])
    expect(wrapper.find('.dialog-stub').exists()).toBe(false)
  })

  it('shows the bytes sent, the percent and the progress bar', () => {
    const wrapper = mountDialog([{ ...recording }])
    const text = wrapper.text()

    expect(text).toContain('Screen recording')
    expect(text).toContain('25%')
    expect(text).toContain(
      'uploadProgress.bytes:{"transferred":"1 MB","total":"4 MB"}',
    )
    expect(wrapper.find('.progress-stub').attributes('data-value')).toBe('25')
    expect(button(wrapper, 'uploadProgress.retry')).toBeUndefined()
    expect(wrapper.find('.alert-stub').exists()).toBe(false)
  })

  it('tells the user when they are offline', () => {
    const wrapper = mountDialog([{ ...recording }], { online: false })
    expect(wrapper.find('.alert-stub').text()).toBe('uploadProgress.offline')
  })

  it('does not promise to continue when Storage refused every upload', () => {
    const wrapper = mountDialog(
      [{ ...recording, status: 'failed', errorCode: 'storage/unauthorized' }],
      { online: false },
    )
    expect(wrapper.find('.alert-stub').exists()).toBe(false)
  })

  it('offers a retry for a failed upload', async () => {
    const wrapper = mountDialog([{ ...recording, status: 'failed' }])

    expect(wrapper.text()).toContain('uploadProgress.failed')
    expect(wrapper.find('.progress-stub').attributes('data-color')).toBe(
      'error',
    )
    await button(wrapper, 'uploadProgress.retry').trigger('click')
    expect(mockUploads.retryUpload).toHaveBeenCalledWith(1)
  })

  it('names the code when Storage refused the upload', () => {
    const wrapper = mountDialog([
      { ...recording, status: 'failed', errorCode: 'storage/unauthorized' },
    ])
    expect(wrapper.text()).toContain(
      'uploadProgress.rejected:{"code":"storage/unauthorized"}',
    )
    expect(wrapper.text()).not.toContain('uploadProgress.failed')
  })

  it('never shows more than 100 percent', () => {
    const wrapper = mountDialog([
      { ...recording, bytesTransferred: 5 * MB, totalBytes: 4 * MB },
    ])
    expect(wrapper.text()).toContain('100%')
    expect(wrapper.find('.progress-stub').attributes('data-value')).toBe('100')
  })

  it('asks before cancelling and warns that a recording is lost', async () => {
    const wrapper = mountDialog([{ ...recording }])

    await button(wrapper, 'uploadProgress.cancel').trigger('click')
    expect(mockUploads.cancelUpload).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain(
      'uploadProgress.confirmCancelRecording:{"label":"Screen recording"}',
    )

    await button(wrapper, 'uploadProgress.keepUploading').trigger('click')
    expect(mockUploads.cancelUpload).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('uploadProgress.confirmCancelTitle')

    await button(wrapper, 'uploadProgress.cancel').trigger('click')
    await button(wrapper, 'uploadProgress.confirmCancel').trigger('click')
    expect(mockUploads.cancelUpload).toHaveBeenCalledWith(1)
    expect(wrapper.text()).not.toContain('uploadProgress.confirmCancelTitle')
  })

  it('tells the user a cancelled file can be chosen again', async () => {
    const wrapper = mountDialog([
      { ...recording, label: 'photo.png', replaceable: true },
    ])

    await button(wrapper, 'uploadProgress.cancel').trigger('click')
    expect(wrapper.text()).toContain(
      'uploadProgress.confirmCancelFile:{"label":"photo.png"}',
    )
  })

  it('closes the confirmation when the upload finishes meanwhile', async () => {
    const wrapper = mountDialog([{ ...recording }])

    await button(wrapper, 'uploadProgress.cancel').trigger('click')
    expect(wrapper.text()).toContain('uploadProgress.confirmCancelTitle')

    mockUploads.uploads.splice(0, 1)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('uploadProgress.confirmCancelTitle')
    expect(mockUploads.cancelUpload).not.toHaveBeenCalled()
  })
})
