import jsPDF from 'jspdf'
import { TextEncoder, TextDecoder } from 'util'
import { downloadAnonymousParticipantIdentifier } from '@/shared/utils/anonymousParticipantUtils'

jest.mock('jspdf', () => ({ __esModule: true, default: jest.fn() }))

const png =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg=='

const participant = {
  identifier: 'participant-123',
  title: 'Anonymous participant - Checkout study',
  description: 'Keep this identifier to refer to your study answers.',
  issuedAt: 'Issued at: 2026-11-22',
}

describe('anonymous participant identifier PDF', () => {
  let image
  let imageConstructor
  let getContext
  let toDataURL
  let drawImage

  beforeAll(() => {
    global.TextEncoder = TextEncoder
    global.TextDecoder = TextDecoder
  })

  beforeEach(() => {
    const { jsPDF: ActualJsPDF } = jest.requireActual('jspdf')
    jsPDF.mockImplementation((options) => {
      const pdf = new ActualJsPDF(options)
      pdf.save = jest.fn()
      return pdf
    })
    image = { naturalWidth: 3334, naturalHeight: 846 }
    imageConstructor = jest
      .spyOn(window, 'Image')
      .mockImplementation(() => image)
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

  it('waits for the SVG to load and saves a real PDF with a PNG image', async () => {
    const download = downloadAnonymousParticipantIdentifier(participant)
    const pdf = jsPDF.mock.results[0].value

    expect(image.src).toBe('/logo_full.svg')
    expect(pdf.save).not.toHaveBeenCalled()

    image.onload()
    await download

    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 512, 130)
    expect(toDataURL).toHaveBeenCalledWith('image/png')
    expect(pdf.save).toHaveBeenCalledWith(
      'ruxailab-anonymous-participant-participant-123.pdf',
    )
    const output = pdf.output()
    expect(output).toContain('/Subtype /Image')
    expect(output).toContain('participant-123')
    expect(output).toContain('Checkout study')
  })

  it('keeps the identifier downloadable when the logo cannot load', async () => {
    const download = downloadAnonymousParticipantIdentifier({
      ...participant,
      filename: 'study-identifier',
    })
    const pdf = jsPDF.mock.results[0].value

    image.onerror()
    await download

    expect(pdf.save).toHaveBeenCalledWith(
      'study-identifier-participant-123.pdf',
    )
    expect(pdf.output()).toContain('participant-123')
    expect(pdf.output()).not.toContain('/Subtype /Image')
  })

  it.each(['missing context', 'rasterization failure'])(
    'keeps the identifier downloadable after %s',
    async (failure) => {
      if (failure === 'missing context') getContext.mockReturnValue(null)
      else
        toDataURL.mockImplementation(() => {
          throw new Error('Canvas failed')
        })
      const download = downloadAnonymousParticipantIdentifier(participant)
      const pdf = jsPDF.mock.results[0].value

      image.onload()
      await download

      expect(pdf.save).toHaveBeenCalledTimes(1)
      expect(pdf.output()).toContain('participant-123')
    },
  )

  it('does not create a document or request the logo without an identifier', async () => {
    await downloadAnonymousParticipantIdentifier({
      ...participant,
      identifier: '',
    })

    expect(jsPDF).not.toHaveBeenCalled()
    expect(imageConstructor).not.toHaveBeenCalled()
  })
})
