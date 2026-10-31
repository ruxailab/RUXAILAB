const HEADER_NAMES = new Set([
  'title',
  'name',
  'card',
  'category',
  'cards',
  'categories',
])

const ALLOWED_IMPORT_EXTENSIONS = ['.csv', '.txt']

/**
 * Splits pasted text into unique item titles, one per non-empty line.
 * Existing titles and duplicates in the paste are skipped (case-insensitive).
 */
export function parseImportLines(text, existingTitles = []) {
  const seen = new Set(
    existingTitles
      .map((title) => String(title || '').trim().toLowerCase())
      .filter(Boolean),
  )

  const titles = []
  let duplicates = 0

  String(text || '')
    .split(/\r?\n/)
    .forEach((line) => {
      const title = line.trim()
      if (!title) return

      const key = title.toLowerCase()
      if (seen.has(key)) {
        duplicates += 1
        return
      }

      seen.add(key)
      titles.push(title)
    })

  return { titles, duplicates }
}

export function isAllowedImportFile(file) {
  const name = String(file?.name || '').toLowerCase()
  return ALLOWED_IMPORT_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export function extractFirstCsvCell(line) {
  const input = String(line || '')
  if (!input.trim()) return ''

  if (input.startsWith('"')) {
    let cell = ''
    for (let i = 1; i < input.length; i += 1) {
      const char = input[i]
      if (char === '"') {
        if (input[i + 1] === '"') {
          cell += '"'
          i += 1
          continue
        }
        break
      }
      cell += char
    }
    return cell.trim()
  }

  const commaIndex = input.indexOf(',')
  return (commaIndex === -1 ? input : input.slice(0, commaIndex)).trim()
}

export function normalizeImportFileText(text) {
  const raw = String(text || '')
  const looksLikeCsv = raw.split(/\r?\n/).some((line) => line.includes(','))
  if (!looksLikeCsv) return raw

  const values = raw.split(/\r?\n/).map(extractFirstCsvCell)
  const firstNonEmptyIndex = values.findIndex((value) => value)
  if (
    firstNonEmptyIndex >= 0 &&
    HEADER_NAMES.has(values[firstNonEmptyIndex].toLowerCase())
  ) {
    values.splice(firstNonEmptyIndex, 1)
  }

  return values.join('\n')
}

export function buildImportExampleCsv(type = 'card') {
  const isCategory = type === 'category'
  const rows = isCategory
    ? [
        ['title', 'description'],
        ['Navigation', 'Main menus and wayfinding'],
        ['Content', 'Articles and media'],
        ['Account', 'Profile and preferences'],
        ['Settings', 'App configuration'],
      ]
    : [
        ['title', 'description'],
        ['Home', 'Landing page'],
        ['Search', 'Find content'],
        ['Profile', 'User account'],
        ['Checkout', 'Complete purchase'],
      ]

  return {
    csv: `${rows.map((row) => row.join(',')).join('\n')}\n`,
    filename: isCategory
      ? 'card-sorting-categories-example.csv'
      : 'card-sorting-cards-example.csv',
  }
}
