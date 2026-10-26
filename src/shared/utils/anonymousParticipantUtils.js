import jsPDF from 'jspdf'
import logoFull from '@/assets/logo_full.png'

export const downloadAnonymousParticipantIdentifier = ({
  identifier,
  title,
  description,
  issuedAt,
  filename = 'ruxailab-anonymous-participant',
}) => {
  if (!identifier) return

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Logo keeps its original alignment.
  const logoMarginLeft = 30

  // Main document content.
  const marginLeft = 32
  const marginRight = 32
  const contentWidth = pageWidth - marginLeft - marginRight

  const colors = {
    primary: [25, 118, 210],
    text: [51, 51, 51],
    muted: [117, 117, 117],
    light: [248, 248, 248],
    border: [224, 224, 224],
  }

  /*
   * --------------------------------------------------------------------------
   * Logo
   * --------------------------------------------------------------------------
   */

  pdf.addImage(logoFull, 'PNG', logoMarginLeft, 18, 42, 12)

  /*
   * --------------------------------------------------------------------------
   * Title
   * --------------------------------------------------------------------------
   */

  pdf.setTextColor(...colors.text)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)

  const titleLines = pdf.splitTextToSize(title, contentWidth)

  const titleY = 40
  pdf.text(titleLines, marginLeft, titleY)

  /*
   * --------------------------------------------------------------------------
   * Description
   * --------------------------------------------------------------------------
   */

  pdf.setTextColor(...colors.muted)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)

  const descriptionLines = pdf.splitTextToSize(description, contentWidth)

  // Keep the same visual spacing regardless of title size.
  const titleLineHeight = 8
  const descriptionY = titleY + titleLines.length * titleLineHeight + 4

  pdf.text(descriptionLines, marginLeft, descriptionY)

  /*
   * --------------------------------------------------------------------------
   * Participant identifier
   * --------------------------------------------------------------------------
   */

  const descriptionLineHeight = 5
  const boxY =
    descriptionY + descriptionLines.length * descriptionLineHeight + 6

  const boxHeight = 30

  pdf.setFillColor(...colors.light)
  pdf.setDrawColor(...colors.border)

  pdf.roundedRect(marginLeft, boxY, contentWidth, boxHeight, 3, 3, 'FD')

  pdf.setTextColor(...colors.muted)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)

  pdf.text('PARTICIPANT ID', marginLeft + 8, boxY + 10)

  pdf.setTextColor(...colors.primary)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(19)

  pdf.text(identifier, marginLeft + 8, boxY + 23)

  /*
   * --------------------------------------------------------------------------
   * Issued date
   * --------------------------------------------------------------------------
   */

  pdf.setTextColor(...colors.muted)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)

  const issuedDateY = boxY + boxHeight + 8

  pdf.text(issuedAt, marginLeft, issuedDateY)

  /*
   * --------------------------------------------------------------------------
   * Footer
   * --------------------------------------------------------------------------
   */

  pdf.setDrawColor(...colors.border)

  pdf.line(
    marginLeft,
    pageHeight - 30,
    pageWidth - marginRight,
    pageHeight - 30,
  )

  pdf.setTextColor(...colors.muted)
  pdf.setFontSize(9)

  pdf.text(
    `RUXAILAB · ${new Date().getFullYear()}`,
    marginLeft,
    pageHeight - 20,
  )

  pdf.save(`${filename}-${identifier}.pdf`)
}
