import { flushPromises, mount } from '@vue/test-utils'
import jsPDF from 'jspdf'
import { TextEncoder, TextDecoder } from 'util'
import ExportPanel from '@/ux/UserTest/components/transcription/ExportPanel.vue'

const mockGetRuns = jest.fn()

jest.mock(
  '@/ai/transcriptions/TranscriptionController',
  () =>
    class {
      getByAnswersDocIdandUserDocIdandTaskId(...args) {
        return mockGetRuns(...args)
      }
    },
)

jest.mock('jspdf', () => ({ __esModule: true, default: jest.fn() }))
jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn((doc) => {
    doc.lastAutoTable = { finalY: 220 }
  }),
}))
jest.mock('@vueup/vue-quill', () => ({
  QuillEditor: { template: '<div />' },
}))

const png =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg=='

const slot = { template: '<div><slot /></div>' }

const mountExportPanel = async () => {
  const wrapper = mount(ExportPanel, {
    props: {
      answersDocId: 'answers-1',
      userDocId: 'user-1',
      taskId: 'task-1',
    },
    global: {
      directives: {
        'safe-html': () => {},
      },
      stubs: {
        'v-alert': slot,
        'v-skeleton-loader': true,
        'v-card': slot,
        'v-card-title': slot,
        'v-card-text': slot,
        'v-toolbar': slot,
        'v-toolbar-title': slot,
        'v-spacer': true,
        'v-chip': slot,
        'v-icon': true,
        'v-tooltip': slot,
        'v-btn': {
          template: '<button><slot /></button>',
        },
        'v-btn-toggle': slot,
        'v-divider': true,
        'v-progress-circular': true,
        'v-card-actions': slot,
        'v-snackbar': slot,
        'v-dialog': slot,
        'v-row': slot,
        'v-col': slot,
        'v-text-field': true,
      },
    },
  })
  await flushPromises()
  return wrapper
}

describe('transcription ExportPanel PDF logo rasterization', () => {
  let image
  let getContext
  let toDataURL
  let drawImage

  beforeAll(() => {
    global.TextEncoder = TextEncoder
    global.TextDecoder = TextDecoder
  })

  beforeEach(() => {
    mockGetRuns.mockResolvedValue([
      {
        id: 'run-1',
        provider: 'whisper',
        model: 'large-v3',
        createdAt: new Date('2026-11-27T10:00:00Z'),
        evaluator: {
          segments: [{ start: 0, end: 2, text: 'Hello evaluator' }],
        },
        moderator: {
          segments: [{ start: 2, end: 4, text: 'Hello moderator' }],
        },
      },
    ])

    const { jsPDF: ActualJsPDF } = jest.requireActual('jspdf')
    jsPDF.mockImplementation((options) => {
      const pdf = new ActualJsPDF(options)
      pdf.save = jest.fn()
      return pdf
    })

    image = { naturalWidth: 3334, naturalHeight: 846 }
    jest.spyOn(window, 'Image').mockImplementation(() => image)
    drawImage = jest.fn()
    getContext = jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage })
    toDataURL = jest
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue(png)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('rasterizes /logo_full.svg to a PNG data URL via canvas before calling jsPDF.addImage', async () => {
    const wrapper = await mountExportPanel()
    const downloadBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Download PDF'))

    await downloadBtn.trigger('click')
    const pdf = jsPDF.mock.results[0].value
    const addImageSpy = jest.spyOn(pdf, 'addImage')

    expect(image.src).toBe('/logo_full.svg')
    expect(pdf.save).not.toHaveBeenCalled()

    image.onload()
    await flushPromises()

    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 512, 130)
    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(addImageSpy).toHaveBeenCalledWith(
      png,
      'PNG',
      48,
      expect.any(Number),
      expect.any(Number),
      10,
      undefined,
      'FAST',
    )
    expect(addImageSpy.mock.calls[0][4]).toBeCloseTo(10 * (3334 / 846), 4)
    expect(pdf.save).toHaveBeenCalledWith(
      expect.stringMatching(
        /^transcription_latest_task-task-1_user-user-1_.*\.pdf$/,
      ),
    )
    expect(pdf.output()).toContain('/Subtype /Image')
  })

  it('still downloads the PDF when the logo fails to load', async () => {
    const wrapper = await mountExportPanel()
    const downloadBtn = wrapper
      .findAll('button')
      .find((btn) => btn.text().includes('Download PDF'))

    await downloadBtn.trigger('click')
    const pdf = jsPDF.mock.results[0].value

    image.onerror()
    await flushPromises()

    expect(pdf.save).toHaveBeenCalledTimes(1)
    expect(pdf.output()).not.toContain('/Subtype /Image')
  })

  it.each(['missing context', 'rasterization failure'])(
    'still downloads the PDF on %s',
    async (failure) => {
      if (failure === 'missing context') getContext.mockReturnValue(null)
      else
        toDataURL.mockImplementation(() => {
          throw new Error('Canvas failed')
        })

      const wrapper = await mountExportPanel()
      const downloadBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('Download PDF'))

      await downloadBtn.trigger('click')
      const pdf = jsPDF.mock.results[0].value

      image.onload()
      await flushPromises()

      expect(pdf.save).toHaveBeenCalledTimes(1)
      expect(pdf.output()).not.toContain('/Subtype /Image')
    },
  )
})
