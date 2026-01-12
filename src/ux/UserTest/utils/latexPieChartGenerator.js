
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
 * @returns {string} LaTeX code
 */
export const generatePieChartLatex = (title, options, counts, colors = []) => {
  // Default colors if not provided
  const defaultColors = ['blue!40', 'green!40', 'orange!40', 'purple!40', 'red!40', 'teal!40', 'yellow!40', 'brown!40']
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
    percentage: total > 0 ? (((counts[option] || 0) / total) * 100).toFixed(1) : 0
  }))

  // Build LaTeX document
  let latex = '\\documentclass{standalone}\n'
  latex += '\\usepackage{tikz}\n'
  latex += '\\begin{document}\n\n'

  // Define custom colors if hex colors were provided
  if (colors && colors.length > 0 && colors[0] && colors[0].startsWith('#')) {
    latex += '\\definecolor{color0}{HTML}{' + colors[0].replace('#', '').toUpperCase() + '}\n'
    for (let i = 1; i < colors.length; i++) {
      if (colors[i] && colors[i].startsWith('#')) {
        latex += `\\definecolor{color${i}}{HTML}{${colors[i].replace('#', '').toUpperCase()}}\n`
      }
    }
    latex += '\n'
  }

  latex += '\\begin{tikzpicture}\n'

  // Draw pie chart with labels on slices
  let startAngle = 0
  data.forEach((item, idx) => {
    const endAngle = startAngle + (item.count / total) * 360
    const color = tikzColors[idx % tikzColors.length]
    const midAngle = (startAngle + endAngle) / 2

    // Draw pie slice
    if (item.count > 0) {
      latex += `\\filldraw[fill=${color}, draw=white, line width=2pt]\n`
      latex += `  (0, 0) -- (${Math.cos((startAngle * Math.PI) / 180) * 1.5}, ${Math.sin((startAngle * Math.PI) / 180) * 1.5})\n`
      latex += `  arc[radius=1.5, start angle=${startAngle}, end angle=${endAngle}]\n`
      latex += `  -- (0, 0);\n\n`

      // Add percentage label on the slice (white text)
      const labelRadius = 0.9
      const labelX = Math.cos((midAngle * Math.PI) / 180) * labelRadius
      const labelY = Math.sin((midAngle * Math.PI) / 180) * labelRadius
      latex += `\\node at (${labelX}, ${labelY}) [font=\\bfseries, text=white] {${item.percentage}\\%};\n\n`
    }

    startAngle = endAngle
  })

  // Draw legend below the pie chart
  latex += '% Legend\n'
  let legendY = -1.8
  data.forEach((item, idx) => {
    const color = tikzColors[idx % tikzColors.length]
    
    // Draw colored circle
    latex += `\\filldraw[fill=${color}] (-2.2, ${legendY}) circle (0.1);\n`
    
    // Draw label text
    latex += `\\node at (-2.0, ${legendY}) [anchor=west, font=\\small] {${escapeLatex(item.label)} (${item.count})};\n`
    
    legendY -= 0.35
  })

  latex += '\n\\end{tikzpicture}\n\n'
  latex += '\\end{document}\n'

  return latex
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
 * @returns {string} PGFPlots LaTeX code
 */
export const generatePgfplotsPieChartLatex = (title, options, counts) => {
  const total = Object.values(counts || {}).reduce((a, b) => a + b, 0)

  let latex = '\\documentclass{standalone}\n'
  latex += '\\usepackage{pgfplots}\n'
  latex += '\\begin{document}\n\n'

  latex += '\\begin{tikzpicture}\n'
  latex += '\\begin{axis}[\n'
  latex += '  title={' + escapeLatex(title) + '},\n'
  latex += '  legend pos=outer north east,\n'
  latex += '  legend columns=1,\n'
  latex += ']\n'
  latex += '\\addplot[pie chart] table[meta index=0] {\n'
  ;(options || []).forEach((option) => {
    const count = counts[option] || 0
    latex += `${count}\n`
  })

  latex += '};\n'
  latex += '\\legend{' + (options || []).map(escapeLatex).join(',') + '}\n'
  latex += '\\end{axis}\n'
  latex += '\\end{tikzpicture}\n\n'
  latex += '\\end{document}\n'

  return latex
}
