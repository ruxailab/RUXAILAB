const escapeXml = (text) =>
  String(text).replace(/[&<>"']/g, (character) => {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    }
    return replacements[character]
  })

const ellipsize = (text, maxWidth, font, context) => {
  context.font = font
  if (context.measureText(text).width <= maxWidth) return text

  const characters = Array.from(text)
  while (
    characters.length &&
    context.measureText(`${characters.join('')}…`).width > maxWidth
  ) {
    characters.pop()
  }
  return `${characters.join('')}…`
}

const downloadBlob = (blob, filename, extension) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${Date.now()}.${extension}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function exportMatrixAsPng({
  filename,
  rowHeaderLabel,
  columns,
  rows,
  cellWidth = 100,
}) {
  const labelWidth = 180
  const headerHeight = 56
  const rowHeight = 36
  const width = labelWidth + columns.length * cellWidth
  const height = headerHeight + rows.length * rowHeight
  const measureContext = document.createElement('canvas').getContext('2d')
  if (!measureContext) throw new Error('Canvas context unavailable')

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<rect width="100%" height="100%" fill="#ffffff"/>',
    '<defs>',
    ...columns.map(
      (_, column) =>
        `<clipPath id="header-clip-${column}"><rect x="${labelWidth + column * cellWidth + 8}" y="0" width="${cellWidth - 16}" height="${headerHeight}"/></clipPath>`,
    ),
    ...rows.map(
      (_, row) =>
        `<clipPath id="row-clip-${row}"><rect x="12" y="${headerHeight + row * rowHeight}" width="${labelWidth - 24}" height="${rowHeight}"/></clipPath>`,
    ),
    '</defs>',
    '<g font-family="Arial, sans-serif" font-size="12" fill="#222222">',
    `<rect x="0" y="0" width="${labelWidth}" height="${headerHeight}" fill="#f5f5f5" stroke="#e5e7eb"/>`,
    `<text x="12" y="34" font-weight="600">${escapeXml(rowHeaderLabel)}</text>`,
  ]

  columns.forEach((columnLabel, column) => {
    const x = labelWidth + column * cellWidth
    const label = ellipsize(
      columnLabel,
      cellWidth - 16,
      '11px Arial',
      measureContext,
    )
    parts.push(
      `<rect x="${x}" y="0" width="${cellWidth}" height="${headerHeight}" fill="#f5f5f5" stroke="#e5e7eb"/>`,
      `<text x="${x + 8}" y="32" font-size="11" clip-path="url(#header-clip-${column})"><title>${escapeXml(columnLabel)}</title>${escapeXml(label)}</text>`,
    )
  })

  rows.forEach((row, rowIndex) => {
    const y = headerHeight + rowIndex * rowHeight
    const label = ellipsize(
      row.label,
      labelWidth - 24,
      '600 12px Arial',
      measureContext,
    )
    parts.push(
      `<rect x="0" y="${y}" width="${labelWidth}" height="${rowHeight}" fill="#ffffff" stroke="#e5e7eb"/>`,
      `<text x="12" y="${y + 23}" font-weight="600" clip-path="url(#row-clip-${rowIndex})"><title>${escapeXml(row.label)}</title>${escapeXml(label)}</text>`,
    )

    row.cells.forEach((cell, column) => {
      const x = labelWidth + column * cellWidth
      parts.push(
        `<rect x="${x}" y="${y}" width="${cellWidth}" height="${rowHeight}" fill="${cell.backgroundColor || '#ffffff'}" stroke="#e5e7eb"/>`,
        `<text x="${x + cellWidth / 2}" y="${y + 23}" text-anchor="middle" fill="${cell.color || '#222222'}" font-weight="600">${escapeXml(cell.text)}</text>`,
      )
    })
  })
  parts.push('</g></svg>')

  const svgBlob = new Blob([parts.join('')], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const svgUrl = URL.createObjectURL(svgBlob)
  try {
    const image = new Image()
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
      image.src = svgUrl
    })

    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas context unavailable')

    context.scale(scale, scale)
    context.drawImage(image, 0, 0)
    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('PNG export failed'))
      }, 'image/png')
    })
    downloadBlob(pngBlob, filename, 'png')
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

const escapeLatex = (text) => {
  const slash = String.fromCharCode(92)
  const replacements = new Map([
    [slash, `${slash}textbackslash{}`],
    ['{', `${slash}{`],
    ['}', `${slash}}`],
    ['$', `${slash}$`],
    ['&', `${slash}&`],
    ['#', `${slash}#`],
    ['_', `${slash}_`],
    ['%', `${slash}%`],
    ['^', `${slash}textasciicircum{}`],
    ['~', `${slash}textasciitilde{}`],
    ['—', `${slash}textemdash{}`],
  ])
  return Array.from(
    String(text),
    (character) => replacements.get(character) ?? character,
  ).join('')
}

export function exportMatrixAsLatex({
  filename,
  rowHeaderLabel,
  columns,
  rows,
}) {
  const slash = String.fromCharCode(92)
  const rowBreak = `${slash}${slash}`
  const columnSpec = `l|${'r'.repeat(columns.length)}`
  const lines = [
    String.raw`\documentclass{article}`,
    String.raw`\usepackage[margin=1in]{geometry}`,
    String.raw`\usepackage{graphicx}`,
    String.raw`\begin{document}`,
    String.raw`\begin{center}`,
    String.raw`\resizebox{\textwidth}{!}{%`,
    String.raw`\begin{tabular}{${columnSpec}}`,
    String.raw`\hline`,
    `${escapeLatex(rowHeaderLabel)} & ${columns.map(escapeLatex).join(' & ')} ${rowBreak}`,
    String.raw`\hline`,
  ]

  rows.forEach((row) => {
    lines.push(
      `${escapeLatex(row.label)} & ${row.cells.map(escapeLatex).join(' & ')} ${rowBreak}`,
      String.raw`\hline`,
    )
  })

  lines.push(
    String.raw`\end{tabular}%`,
    '}',
    String.raw`\end{center}`,
    String.raw`\end{document}`,
  )
  downloadBlob(
    new Blob([lines.join('\n')], { type: 'application/x-tex;charset=utf-8' }),
    filename,
    'tex',
  )
}
