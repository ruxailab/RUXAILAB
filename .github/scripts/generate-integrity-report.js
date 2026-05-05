'use strict'

/**
 * generate-integrity-report.js
 *
 * Reads captured log files from each security job AND quality metric JSON files
 * produced by the unified Quality & Security Pipeline, then writes a single
 * consolidated JSON report.
 *
 * Backward-compatible: when QUALITY_ARTIFACT_PREFIX is not set the script
 * behaves exactly as before (reads from integrity-job1/2/3, writes to
 * integrity-report/security-report.json).
 *
 * Environment variables (set by quality-pipeline.yml):
 *   QUALITY_ARTIFACT_PREFIX  — artifact directory prefix, e.g. "quality-job"
 *                              When present, security logs are read from
 *                              <prefix>5/, <prefix>6/, <prefix>7/ and quality
 *                              JSONs from <prefix>1/ … <prefix>4/.
 *   REPORT_OUTPUT_DIR        — directory for the output JSON
 *                              (default: "integrity-report")
 *
 * Output file:  <REPORT_OUTPUT_DIR>/report.json
 *               (legacy path: integrity-report/security-report.json)
 *
 * JSON schema (v2 — unified pipeline):
 * {
 *   schema_version, pipeline, metadata: { repository, ref, sha, run_id, generated_at },
 *   languages_targeted: [...],
 *   summary: { overall, jobs: { <job-id>: "pass|fail|skipped" } },
 *   quality: { complexity, nesting, identifier_length, fog_index },
 *   security: { access_control, route_auth, static_scan },
 *   // legacy flat fields kept for render-integrity-html.js compatibility:
 *   overall: { status, total_errors, total_warnings, total_notices },
 *   jobs: [{ id, name, status, errors, warnings, notices, findings }]
 * }
 */

const fs = require('fs')
const path = require('path')

// ─── Path resolution ─────────────────────────────────────────────────────────

const PREFIX = process.env.QUALITY_ARTIFACT_PREFIX || null  // e.g. "quality-job"
const OUTPUT_DIR = process.env.REPORT_OUTPUT_DIR || 'integrity-report'

// When running inside the unified pipeline the security logs live in
// quality-job5/, quality-job6/, quality-job7/.
// When running from the legacy integrity-GP.yml they live in integrity-job1/2/3.
const securityJobDir = (n) =>
  PREFIX ? path.join(`${PREFIX}${n}`) : path.join(`integrity-job${n - 4}`)

// ─── Security job definitions ────────────────────────────────────────────────

const SECURITY_JOBS = [
  {
    id: 'access-control',
    name: 'Access Control Audit',
    file: path.join(securityJobDir(5), 'access-control.log'),
  },
  {
    id: 'route-auth',
    name: 'Route Authorization Audit',
    file: path.join(securityJobDir(6), 'route-auth.log'),
  },
  {
    id: 'static-scan',
    name: 'Static Security Analysis',
    file: path.join(securityJobDir(7), 'static-scan.log'),
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function readLog(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Parses a job log file for GitHub Actions annotations.
 * Handles both ::error:: and ::error file=foo.js::message forms.
 */
function parseLog(content) {
  if (!content) {
    return { findings: [], status: 'unknown', errors: 0, warnings: 0, notices: 0 }
  }

  const findings = []

  for (const line of content.split('\n')) {
    const fileMatch = line.match(/::(?:error|warning)[^:]*file=([^:,]+)[^:]*::(.+)/)
    const errorMatch = line.match(/::error[^:]*::(.+)/)
    const warningMatch = line.match(/::warning[^:]*::(.+)/)
    const noticeMatch = line.match(/::notice[^:]*::(.+)/)

    if (errorMatch) {
      findings.push({
        level: 'error',
        message: errorMatch[1].trim(),
        file: fileMatch ? fileMatch[1].trim() : null,
      })
    } else if (warningMatch) {
      findings.push({
        level: 'warning',
        message: warningMatch[1].trim(),
        file: fileMatch ? fileMatch[1].trim() : null,
      })
    } else if (noticeMatch) {
      findings.push({
        level: 'notice',
        message: noticeMatch[1].trim(),
        file: null,
      })
    }
  }

  const errors = findings.filter((f) => f.level === 'error').length
  const warnings = findings.filter((f) => f.level === 'warning').length
  const notices = findings.filter((f) => f.level === 'notice').length

  const hasFail = errors > 0 || content.includes('❌')
  const status = hasFail ? 'fail' : warnings > 0 ? 'warn' : 'pass'

  return { findings, status, errors, warnings, notices }
}

/**
 * Derives a "pass | fail | skipped" status from a quality metric JSON.
 * A missing / unreadable file is treated as "skipped".
 */
function qualityStatus(json) {
  if (!json) return 'skipped'
  if (json.skipped) return 'skipped'
  return json.summary && json.summary.failed_files > 0 ? 'fail' : 'pass'
}

// ─── Read quality metric JSONs (only available in unified pipeline) ──────────

const qualityData = PREFIX
  ? {
      complexity:        readJson(path.join(`${PREFIX}1`, 'complexity-results.json')),
      nesting:           readJson(path.join(`${PREFIX}2`, 'nesting_metrics.json')),
      identifier_length: readJson(path.join(`${PREFIX}3`, 'identifier_report.json')),
      fog_index:         readJson(path.join(`${PREFIX}4`, 'fog-results.json')),
    }
  : null

// ─── Main ────────────────────────────────────────────────────────────────────

const securityResults = SECURITY_JOBS.map((job) => {
  const content = readLog(job.file)
  const { findings, status, errors, warnings, notices } = parseLog(content)
  return { id: job.id, name: job.name, status, errors, warnings, notices, findings }
})

const totalErrors   = securityResults.reduce((s, r) => s + r.errors, 0)
const totalWarnings = securityResults.reduce((s, r) => s + r.warnings, 0)
const totalNotices  = securityResults.reduce((s, r) => s + r.notices, 0)

const securityOverall = securityResults.some((r) => r.status === 'fail')
  ? 'fail'
  : securityResults.some((r) => r.status === 'warn' || r.status === 'unknown')
    ? 'warn'
    : 'pass'

// Overall status includes quality failures when running in unified pipeline
const qualityOverall = qualityData
  ? Object.values(qualityData).some((d) => qualityStatus(d) === 'fail') ? 'fail' : 'pass'
  : 'pass'

const overallStatus =
  securityOverall === 'fail' || qualityOverall === 'fail'
    ? 'fail'
    : securityOverall === 'warn'
      ? 'warn'
      : 'pass'

// ─── Build report ────────────────────────────────────────────────────────────

const jobsSummary = {
  'access-control-audit': securityResults.find((r) => r.id === 'access-control')?.status ?? 'skipped',
  'route-auth-audit':     securityResults.find((r) => r.id === 'route-auth')?.status     ?? 'skipped',
  'static-security-scan': securityResults.find((r) => r.id === 'static-scan')?.status    ?? 'skipped',
}

if (qualityData) {
  jobsSummary['cyclomatic-complexity'] = qualityStatus(qualityData.complexity)
  jobsSummary['nesting-depth']         = qualityStatus(qualityData.nesting)
  jobsSummary['identifier-length']     = qualityStatus(qualityData.identifier_length)
  jobsSummary['fog-index-metrics']     = qualityStatus(qualityData.fog_index)
}

const report = {
  schema_version: '2.0',
  pipeline: PREFIX ? 'quality-and-security' : 'integrity',
  metadata: {
    repository:   process.env.GITHUB_REPOSITORY || '',
    ref:          process.env.GITHUB_REF_NAME   || '',
    sha:          process.env.GITHUB_SHA        || '',
    run_id:       process.env.GITHUB_RUN_ID     || '',
    generated_at: new Date().toISOString(),
  },
  languages_targeted: ['python', 'javascript', 'typescript', 'java', 'csharp'],
  summary: {
    overall: overallStatus,
    jobs: jobsSummary,
  },
  // Quality metric data (null when running from legacy integrity-GP.yml)
  quality: qualityData
    ? {
        complexity:        qualityData.complexity        ?? null,
        nesting:           qualityData.nesting           ?? null,
        identifier_length: qualityData.identifier_length ?? null,
        fog_index:         qualityData.fog_index         ?? null,
      }
    : null,
  // Security audit data
  security: {
    access_control: securityResults.find((r) => r.id === 'access-control') ?? null,
    route_auth:     securityResults.find((r) => r.id === 'route-auth')     ?? null,
    static_scan:    securityResults.find((r) => r.id === 'static-scan')    ?? null,
  },
  // ── Legacy flat fields kept for render-integrity-html.js compatibility ──
  overall: {
    status:          overallStatus,
    total_errors:    totalErrors,
    total_warnings:  totalWarnings,
    total_notices:   totalNotices,
  },
  jobs: securityResults,
}

// ─── Write output ────────────────────────────────────────────────────────────

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// Unified pipeline writes report.json; legacy path is security-report.json
const outFileName = PREFIX ? 'report.json' : 'security-report.json'
const outFile = path.join(OUTPUT_DIR, outFileName)
fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8')

console.log(`✅ Report generated: ${outFile}`)
console.log(`   Pipeline : ${report.pipeline}`)
console.log(`   Status   : ${overallStatus.toUpperCase()}`)
console.log(`   Errors   : ${totalErrors}`)
console.log(`   Warnings : ${totalWarnings}`)
console.log(`   Notices  : ${totalNotices}`)

if (qualityData) {
  console.log('   Quality  :',
    Object.entries(jobsSummary)
      .filter(([k]) => !['access-control-audit','route-auth-audit','static-security-scan'].includes(k))
      .map(([k, v]) => `${k}=${v}`)
      .join(', ')
  )
}