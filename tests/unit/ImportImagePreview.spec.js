import { shallowMount } from '@vue/test-utils'
import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage'
import ImportImage from '@/ux/Heuristic/components/ImportImage.vue'
import { showError } from '@/shared/utils/toast'

const mockDispatch = jest.fn()
jest.mock('vuex', () => ({
  useStore: () => ({ getters: {}, dispatch: mockDispatch }),
}))
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}))
jest.mock('@/shared/utils/toast', () => ({ showError: jest.fn() }))

const mountImport = () =>
  shallowMount(ImportImage, {
    props: {
      preview: true,
      testId: 'study-1',
      heuristicId: '0',
      questionId: '0',
    },
    global: { mocks: { $t: (key) => key } },
  })

it('keeps preview attachments in memory without uploading or updating shared state', async () => {
  const wrapper = mountImport()
  const file = new File(['image'], 'example.png', { type: 'image/png' })
  await wrapper.vm.uploadSelectedFile(file)
  expect(wrapper.emitted('imageUploaded')).toEqual([
    [
      expect.stringMatching(/^data:image\/png;base64,/),
      { name: file.name, size: file.size, type: file.type },
      0,
      0,
    ],
  ])
  expect(getStorage).not.toHaveBeenCalled()
  expect(uploadBytes).not.toHaveBeenCalled()
  expect(getDownloadURL).not.toHaveBeenCalled()
  expect(mockDispatch).not.toHaveBeenCalled()
  wrapper.unmount()
})

it('reports local attachment errors without attempting a remote upload', async () => {
  const read = jest
    .spyOn(FileReader.prototype, 'readAsDataURL')
    .mockImplementation(() => {
      throw new Error('Cannot read file')
    })
  const wrapper = mountImport()
  try {
    await wrapper.vm.uploadSelectedFile(new File(['image'], 'example.png'))
    expect(showError).toHaveBeenCalledWith(
      'HeuristicsTable.ImportImage.uploadError',
    )
    expect(uploadBytes).not.toHaveBeenCalled()
  } finally {
    read.mockRestore()
    wrapper.unmount()
  }
})
