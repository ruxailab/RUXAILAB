/**
 * Escape special LaTeX characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeLatex = (text) => {
  if (!text) return ''
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}~^])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
}

/**
 * Generate LaTeX TikZ code for a pie chart
 * @param {string} title - Chart title
 * @param {Array} options - Array of option labels
 * @param {Object} counts - Object with counts for each option
 * @param {Array} colors - Array of hex color codes
 * @returns {Object} Object with packages and content properties
 */
export const generatePieChartLatex = (title, options, counts, colors = []) => {
  // Default colors if not provided
  const defaultColors = [
    'blue!40',
    'green!40',
    'orange!40',
    'purple!40',
    'red!40',
    'teal!40',
    'yellow!40',
    'brown!40',
  ]
  const chartColors = colors && colors.length > 0 ? colors : defaultColors

  // Convert hex colors to TikZ format if needed
  const tikzColors = chartColors.map((color, idx) => {
    if (color && color.startsWith('#')) {
      return `color${idx}`
    }
    return color
  })

  // Calculate totals and percentages
  const total = Object.values(counts || {}).reduce((a, b) => a + b, 0)
  const data = (options || []).map((option) => ({
    label: option,
    count: counts[option] || 0,
    percentage:
      total > 0 ? (((counts[option] || 0) / total) * 100).toFixed(1) : 0,
  }))

  // Build packages section
  let packages = '\\usepackage{tikz}\n'

  // Build content section
  let content = ''

  // Define custom colors if hex colors were provided
  if (colors && colors.length > 0 && colors[0] && colors[0].startsWith('#')) {
    content +=
      '\\definecolor{color0}{HTML}{' +
      colors[0].replace('#', '').toUpperCase() +
      '}\n'
    for (let i = 1; i < colors.length; i++) {
      if (colors[i] && colors[i].startsWith('#')) {
        content += `\\definecolor{color${i}}{HTML}{${colors[i]
          .replace('#', '')
          .toUpperCase()}}\n`
      }
    }
    content += '\n'
  }

  content += '\\begin{tikzpicture}\n'

  // Draw pie chart with labels on slices
  let startAngle = 0
  data.forEach((item, idx) => {
    const endAngle = startAngle + (item.count / total) * 360
    const color = tikzColors[idx % tikzColors.length]
    const midAngle = (startAngle + endAngle) / 2

    // Draw pie slice
    if (item.count > 0) {
      content += `\\filldraw[fill=${color}, draw=white, line width=2pt]\n`
      content += `  (0, 0) -- (${
        Math.cos((startAngle * Math.PI) / 180) * 1.5
      }, ${Math.sin((startAngle * Math.PI) / 180) * 1.5})\n`
      content += `  arc[radius=1.5, start angle=${startAngle}, end angle=${endAngle}]\n`
      content += `  -- (0, 0);\n\n`

      // Add percentage label on the slice (white text)
      const labelRadius = 0.9
      const labelX = Math.cos((midAngle * Math.PI) / 180) * labelRadius
      const labelY = Math.sin((midAngle * Math.PI) / 180) * labelRadius
      content += `\\node at (${labelX}, ${labelY}) [font=\\bfseries, text=white] {${item.percentage}\\%};\n\n`
    }

    startAngle = endAngle
  })

  // Draw legend below the pie chart
  content += '% Legend\n'
  let legendY = -1.8
  data.forEach((item, idx) => {
    const color = tikzColors[idx % tikzColors.length]

    // Draw colored circle
    content += `\\filldraw[fill=${color}] (-2.2, ${legendY}) circle (0.1);\n`

    // Draw label text
    content += `\\node at (-2.0, ${legendY}) [anchor=west, font=\\small] {${escapeLatex(
      item.label,
    )} (${item.count})};\n`

    legendY -= 0.35
  })

  content += '\\end{tikzpicture}\n'

  return { packages, content }
}

/**
 * Generate simplified LaTeX code (without TikZ, just raw data representation)
 * @param {string} title - Chart title
 * @param {Array} options - Array of option labels
 * @param {Object} counts - Object with counts for each option
 * @returns {string} Simplified LaTeX code
 */
export const generateSimplifiedPieChartLatex = (title, options, counts) => {
  let latex = '% Pie Chart Data\n'
  latex += `% Title: ${escapeLatex(title)}\n\n`

  const total = Object.values(counts || {}).reduce((a, b) => a + b, 0)

  latex += '\\begin{tabular}{|c|c|c|}\n'
  latex += '\\hline\n'
  latex += '\\textbf{Option} & \\textbf{Count} & \\textbf{Percentage} \\\\\n'
  latex += '\\hline\n'
  ;(options || []).forEach((option) => {
    const count = counts[option] || 0
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0
    latex += `${escapeLatex(option)} & ${count} & ${percentage}\\% \\\\\n`
  })

  latex += '\\hline\n'
  latex += `\\textbf{Total} & ${total} & 100\\% \\\\\n`
  latex += '\\hline\n'
  latex += '\\end{tabular}\n'

  return latex
}

/**
 * Generate PGFPlots LaTeX code (more compact and modern)
 * @param {string} title - Chart title
 * @param {Array} options - Array of option labels
 * @param {Object} counts - Object with counts for each option
 * @returns {Object} Object with packages and content properties
 */
export const generatePgfplotsPieChartLatex = (title, options, counts) => {
  let packages = '\\usepackage{pgfplots}\n'

  let content = '\\begin{tikzpicture}\n'
  content += '\\begin{axis}[\n'
  content += '  title={' + escapeLatex(title) + '},\n'
  content += '  legend pos=outer north east,\n'
  content += '  legend columns=1,\n'
  content += ']\n'
  content += '\\addplot[pie chart] table[meta index=0] {\n'
  ;(options || []).forEach((option) => {
    const count = counts[option] || 0
    content += `${count}\n`
  })

  content += '};\n'
  content += '\\legend{' + (options || []).map(escapeLatex).join(',') + '}\n'
  content += '\\end{axis}\n'
  content += '\\end{tikzpicture}\n'

  return { packages, content }
}
