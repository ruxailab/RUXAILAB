#!/usr/bin/env node

/**
 i18n Translation Validator - Diff-based (Multi-locale)
  - Validates ONLY new/modified i18n usage in git diff
  - Dynamically checks missing keys in all other locales
**/

import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const BASE_LOCALE = 'en'
const ALL_LOCALES = ['en', 'es', 'pt_br', 'hi', 'de', 'fr', 'zh', 'ar', 'ru', 'ja']
const LOCALES_DIR = 'src/app/plugins/locales'
const GIT_BIN = '/usr/bin/git'

function gitDiff(args) {
  try {
    return execFileSync(GIT_BIN, args, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

function getDiff() {
  if (process.env.GITHUB_BASE_REF) {
    return gitDiff([
      'diff',
      `origin/${process.env.GITHUB_BASE_REF}...HEAD`
    ])
  }

  return (
    gitDiff(['diff', 'HEAD~1...HEAD']) ||
    gitDiff(['diff', '--cached']) ||
    gitDiff(['diff']) ||
    ''
  )
}

const diff = getDiff()

if (!diff.trim()) {
  console.log('[INFO] No diff detected, skipping i18n validation')
  process.exit(0)
}

const addedCodeLines = []
let currentFile = null

for (const line of diff.split('\n')) {
  const fileMatch = line.match(/^\+\+\+ b\/(.+)/)
  if (fileMatch) {
    currentFile = fileMatch[1]
    continue
  }

  if (!line.startsWith('+') || line.startsWith('+++')) continue

  if (currentFile && /\.(js|ts|vue)$/.test(currentFile)) {
    addedCodeLines.push(line.slice(1))
  }
}

console.log(`[INFO] Analyzing ${addedCodeLines.length} added code lines`)

const codeKeys = new Set()

const patterns = [
  /\$t\s*\(\s*['"`]([\w.-]+)['"`]\s*[,)]/g,
  /\bt\s*\(\s*['"`]([\w.-]+)['"`]\s*[,)]/g,
  /\$tc\s*\(\s*['"`]([\w.-]+)['"`]\s*[,)]/g,
  /v-t\s*=\s*['"`]([\w.-]+)['"`]/g,
  /keypath\s*=\s*['"`]([\w.-]+)['"`]/g,
  /\.t\s*\(\s*['"`]([\w.-]+)['"`]\s*[,)]/g,
  /:\w+\s*=\s*['"]\$t\(['"`]([\w.-]+)['"`]\)/g,
  /{{\s*\$t\s*\(\s*['"`]([\w.-]+)['"`]/g,
  /show(?:Toast|Success|Error|Info|Warning)\s*\(\s*['"`]([\w.-]+)['"`]\s*[,)]/g,
  /toast\.(?:success|error|info|warning)\s*\(\s*['"`]([\w.-]+)['"`]\s*[,)]/g,
  /\btoast\s*\(\s*['"`]([\w.-]+)['"`]\s*[,)]/g,
]

for (const line of addedCodeLines) {
  for (const pattern of patterns) {
    for (const match of line.matchAll(pattern)) {
      const key = match[1].trim()
      if (key.includes('.')) {
        codeKeys.add(key)
      }
    }
  }
}

console.log(`[INFO] Found ${codeKeys.size} i18n key(s) in added code`)

function loadLocale(locale) {
  const file = path.join(LOCALES_DIR, `${locale}.json`)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function hasKey(obj, key) {
  return key.split('.').every(p => {
    if (obj && typeof obj === 'object' && p in obj) {
      obj = obj[p]
      return true
    }
    return false
  })
}

const enJson = loadLocale(BASE_LOCALE)
if (!enJson) {
  console.error(`[ERROR] ${BASE_LOCALE}.json missing or invalid`)
  process.exit(1)
}

const missingInEn = [...codeKeys].filter(k => !hasKey(enJson, k))

const localeMissingMap = {}
const otherLocales = ALL_LOCALES.filter(l => l !== BASE_LOCALE)

console.log(`[INFO] Checking ${otherLocales.length} other locale(s): ${otherLocales.join(', ')}`)

for (const locale of otherLocales) {
  const json = loadLocale(locale)
  const missing = json
    ? [...codeKeys].filter(k => !hasKey(json, k))
    : [...codeKeys]

  localeMissingMap[locale] = missing
  console.log(`[DEBUG] ${locale}.json missing ${missing.length} keys`)
}

const hasOtherLocaleMissing = Object.values(localeMissingMap).some(v => v.length)

if (missingInEn.length || hasOtherLocaleMissing) {
  console.error('\n' + '='.repeat(50))
  console.error('i18n Translation Validation Failed')
  console.error('='.repeat(50))

  // CI CONSOLE OUTPUT

  if (missingInEn.length) {
    console.error(`\nError: ${missingInEn.length} NEW missing key(s) in en.json:\n`)
    missingInEn.forEach(k => console.error(`  - ${k}`))
  }

  const localeFailures = Object.entries(localeMissingMap).filter(
    ([, v]) => v.length
  )

  if (localeFailures.length) {
    console.error('\nError: Missing keys in other locales:\n')
    localeFailures.forEach(([locale, keys]) => {
      console.error(`  ${locale}: ${keys.length} missing`)
    })
  }

  console.error('\n')

  // PR COMMENT REPORT

  let report = '### i18n Translation Validation Failed\n\n'

  if (missingInEn.length) {
    report += '#### Missing keys in en.json\n\n'
    missingInEn.forEach((k, i) => {
      report += `${i + 1}. \`${k}\`\n`
    })
  }

  if (localeFailures.length) {
    report += '\n---\n\n#### Missing keys in other locales\n\n'
    report += '| Locale | Missing | Locale | Missing | Locale | Missing |\n'
    report += '|--------|---------|--------|---------|--------|---------|\n'

    for (let i = 0; i < localeFailures.length; i += 3) {
      const row = localeFailures.slice(i, i + 3)
      const cells = row.map(([l, m]) => ` ${l} | ${m.length} `)
      while (cells.length < 3) cells.push('  |  ')
      report += `|${cells.join('|')}|\n`
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `report<<EOF\n${report}\nEOF\n`
    )
  }

  process.exit(1)
}

console.log('[SUCCESS] i18n validation passed')
process.exit(0)
