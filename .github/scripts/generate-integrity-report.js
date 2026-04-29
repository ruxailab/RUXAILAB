'use strict'

/**
 * generate-integrity-report.js
 *
 * Reads captured log files from each Integrity pipeline job,
 * parses GitHub Actions annotations (::error:: / ::warning:: / ::notice::),
 * and produces a universal JSON security report.
 *
 * JSON is stack-agnostic and can be consumed by any downstream tool
 * (dashboards, Python scripts, other pipelines, visualisation layers).
 *
 * Expected log files:
 *   integrity-job1/access-control.log  — Access Control Audit
 *   integrity-job2/route-auth.log      — Route Authorization Audit
 *   integrity-job3/static-scan.log     — Static Security Analysis
 *
 * Output:
 *   integrity-report/security-report.json
 *
 * JSON schema:
 * {
 *   schema_version, pipeline, metadata: { repository, ref, sha, run_id, generated_at },
 *   overall: { status, total_errors, total_warnings, total_notices },
 *   jobs: [{ id, name, status, errors, warnings, notices,
 *            findings: [{ level, message, file }] }]
 * }
 */

const fs = require('fs')
const path = require('path')

// ─── Job definitions ────────────────────────────────────────────────────────

const JOBS = [
  {
    id: 'access-control',
    name: 'Access Control Audit',
    file: path.join('integrity-job1', 'access-control.log'),
  },
  {
    id: 'route-auth',
    name: 'Route Authorization Audit',
    file: path.join('integrity-job2', 'route-auth.log'),
  },
  {
    id: 'static-scan',
    name: 'Static Security Analysis',
    file: path.join('integrity-job3', 'static-scan.log'),
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

// ─── Main ────────────────────────────────────────────────────────────────────

const results = JOBS.map((job) => {
  const content = readLog(job.file)
  const { findings, status, errors, warnings, notices } = parseLog(content)
  return { id: job.id, name: job.name, status, errors, warnings, notices, findings }
})

const totalErrors = results.reduce((s, r) => s + r.errors, 0)
const totalWarnings = results.reduce((s, r) => s + r.warnings, 0)
const totalNotices = results.reduce((s, r) => s + r.notices, 0)

const overallStatus = results.some((r) => r.status === 'fail')
  ? 'fail'
  : results.some((r) => r.status === 'warn' || r.status === 'unknown')
    ? 'warn'
    : 'pass'

const report = {
  schema_version: '1.0',
  pipeline: 'integrity',
  metadata: {
    repository: process.env.GITHUB_REPOSITORY || '',
    ref: process.env.GITHUB_REF_NAME || '',
    sha: process.env.GITHUB_SHA || '',
    run_id: process.env.GITHUB_RUN_ID || '',
    generated_at: new Date().toISOString(),
  },
  overall: {
    status: overallStatus,
    total_errors: totalErrors,
    total_warnings: totalWarnings,
    total_notices: totalNotices,
  },
  jobs: results,
}

// ─── Write output ────────────────────────────────────────────────────────────

fs.mkdirSync('integrity-report', { recursive: true })
const outFile = path.join('integrity-report', 'security-report.json')
fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8')

console.log(`✅ Report generated: ${outFile}`)
console.log(`   Status   : ${overallStatus.toUpperCase()}`)
console.log(`   Errors   : ${totalErrors}`)
console.log(`   Warnings : ${totalWarnings}`)
console.log(`   Notices  : ${totalNotices}`)
