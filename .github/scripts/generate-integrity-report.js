'use strict'

/**
 * generate-integrity-report.js
 *
 * Reads captured log files from each Integrity pipeline job,
 * parses GitHub Actions annotations (::error:: / ::warning:: / ::notice::),
 * and produces a self-contained HTML security report.
 *
 * Expected log files:
 *   integrity-job1/access-control.log  — Access Control Audit
 *   integrity-job2/route-auth.log      — Route Authorization Audit
 *   integrity-job3/static-scan.log     — Static Security Analysis
 *
 * Output:
 *   integrity-report/security-report.html
 */

const fs = require('fs')
const path = require('path')

// ─── Job definitions ────────────────────────────────────────────────────────

const JOBS = [
  {
    id: 'access-control',
    name: 'Access Control Audit',
    icon: '🛡️',
    file: path.join('integrity-job1', 'access-control.log'),
  },
  {
    id: 'route-auth',
    name: 'Route Authorization Audit',
    icon: '🔑',
    file: path.join('integrity-job2', 'route-auth.log'),
  },
  {
    id: 'static-scan',
    name: 'Static Security Analysis',
    icon: '🔍',
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
    // ::error file=path::message  OR  ::error::message
    const errorMatch = line.match(/::error[^:]*::(.+)/)
    const warningMatch = line.match(/::warning[^:]*::(.+)/)
    const noticeMatch = line.match(/::notice[^:]*::(.+)/)
    const fileMatch = line.match(/::(?:error|warning)[^:]*file=([^:,]+)[^:]*::(.+)/)

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── HTML building blocks ────────────────────────────────────────────────────

function statusBadge(status) {
  const map = {
    pass: ['✅ PASS', '#16a34a', '#dcfce7'],
    warn: ['⚠️ WARN', '#d97706', '#fef3c7'],
    fail: ['❌ FAIL', '#dc2626', '#fee2e2'],
    unknown: ['❓ N/A', '#6b7280', '#f3f4f6'],
  }
  const [label, color, bg] = map[status] || map.unknown
  return `<span style="background:${bg};color:${color};border:1px solid ${color};padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px;white-space:nowrap">${label}</span>`
}

function levelChip(level) {
  const map = {
    error: ['ERROR', '#dc2626', '#fee2e2'],
    warning: ['WARN', '#d97706', '#fef3c7'],
    notice: ['INFO', '#2563eb', '#eff6ff'],
  }
  const [label, color, bg] = map[level] || ['INFO', '#6b7280', '#f3f4f6']
  return `<span style="background:${bg};color:${color};padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:.3px;white-space:nowrap">${label}</span>`
}

function statBox(value, label, color, bg) {
  return `<div style="background:${bg};border-radius:10px;padding:14px 18px;text-align:center;min-width:80px">
    <div style="font-size:28px;font-weight:800;color:${color};line-height:1">${value}</div>
    <div style="font-size:11px;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:.5px">${label}</div>
  </div>`
}

// ─── Build per-job section ───────────────────────────────────────────────────

function buildJobSection(job) {
  const { name, icon, findings, status, errors, warnings, notices, content } = job

  let findingsHtml
  if (findings.length === 0) {
    findingsHtml = `<p style="color:#64748b;font-style:italic;margin:0;font-size:14px">
      ${content === null ? '⚠️ Log not available — job may have failed before producing output.' : 'No security annotations found.'}
    </p>`
  } else {
    findingsHtml = findings
      .map(
        (f) => `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">
        <div style="flex-shrink:0;padding-top:1px">${levelChip(f.level)}</div>
        <div>
          <div style="font-family:ui-monospace,monospace;font-size:13px;color:#1e293b;word-break:break-word">${escapeHtml(f.message)}</div>
          ${f.file ? `<div style="font-size:11px;color:#94a3b8;margin-top:3px">📄 ${escapeHtml(f.file)}</div>` : ''}
        </div>
      </div>`,
      )
      .join('')
  }

  const rawSection =
    content !== null
      ? `<details style="margin-top:16px">
          <summary style="cursor:pointer;color:#64748b;font-size:12px;user-select:none;padding:6px 0">▶ Show raw log</summary>
          <pre style="background:#0f172a;color:#94a3b8;padding:16px;border-radius:8px;overflow:auto;font-size:11px;max-height:360px;margin:8px 0 0;line-height:1.6">${escapeHtml(content)}</pre>
        </details>`
      : ''

  return `
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
      <h2 style="margin:0;font-size:17px;color:#0f172a;display:flex;align-items:center;gap:8px">
        ${icon} ${escapeHtml(name)}
      </h2>
      ${statusBadge(status)}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
      ${statBox(errors, 'Errors', '#dc2626', '#fee2e2')}
      ${statBox(warnings, 'Warnings', '#d97706', '#fef3c7')}
      ${statBox(notices, 'Notices', '#2563eb', '#eff6ff')}
    </div>
    <div>${findingsHtml}</div>
    ${rawSection}
  </div>`
}

// ─── Main ────────────────────────────────────────────────────────────────────

const results = JOBS.map((job) => {
  const content = readLog(job.file)
  const parsed = parseLog(content)
  return { ...job, content, ...parsed }
})

const totalErrors = results.reduce((s, r) => s + r.errors, 0)
const totalWarnings = results.reduce((s, r) => s + r.warnings, 0)
const totalNotices = results.reduce((s, r) => s + r.notices, 0)

const overallStatus = results.some((r) => r.status === 'fail')
  ? 'fail'
  : results.some((r) => r.status === 'warn' || r.status === 'unknown')
    ? 'warn'
    : 'pass'

const now = new Date().toUTCString()
const repo = process.env.GITHUB_REPOSITORY || 'RUXAILAB'
const runId = process.env.GITHUB_RUN_ID || ''
const sha = (process.env.GITHUB_SHA || '').slice(0, 7)
const ref = process.env.GITHUB_REF_NAME || ''

const summaryRows = results
  .map(
    (r) => `
    <tr>
      <td style="padding:12px 16px"><strong>${r.icon} ${escapeHtml(r.name)}</strong></td>
      <td style="padding:12px 16px">${statusBadge(r.status)}</td>
      <td style="padding:12px 16px;text-align:center;font-weight:700;color:${r.errors > 0 ? '#dc2626' : '#64748b'}">${r.errors}</td>
      <td style="padding:12px 16px;text-align:center;font-weight:700;color:${r.warnings > 0 ? '#d97706' : '#64748b'}">${r.warnings}</td>
      <td style="padding:12px 16px;text-align:center;color:#64748b">${r.notices}</td>
    </tr>`,
  )
  .join('')

const detailSections = results.map(buildJobSection).join('')

const overallColor = { pass: '#16a34a', warn: '#d97706', fail: '#dc2626', unknown: '#6b7280' }[overallStatus]
const overallBg = { pass: '#dcfce7', warn: '#fef3c7', fail: '#fee2e2', unknown: '#f3f4f6' }[overallStatus]
const overallLabel = { pass: '✅ ALL CHECKS PASSED', warn: '⚠️ WARNINGS DETECTED', fail: '❌ SECURITY ISSUES FOUND', unknown: '❓ INCOMPLETE' }[overallStatus]

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Integrity Security Report — ${escapeHtml(repo)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 24px 16px;
      line-height: 1.5;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px 16px;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .5px;
      border-bottom: 1px solid #e2e8f0;
    }
    td { border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    details summary::-webkit-details-marker { display: none; }
    @media (max-width: 640px) {
      .meta-grid { flex-direction: column !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:960px;margin:0 auto">

    <!-- Header -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px;margin-bottom:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div>
          <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a">🔐 Integrity Security Report</h1>
          <p style="margin:0;color:#64748b;font-size:13px">${escapeHtml(repo)}${ref ? ` · ${escapeHtml(ref)}` : ''}${sha ? ` · <code>${escapeHtml(sha)}</code>` : ''}</p>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:12px">Generated: ${now}${runId ? ` · <a href="https://github.com/${escapeHtml(repo)}/actions/runs/${escapeHtml(runId)}" style="color:#94a3b8">Run #${escapeHtml(runId)}</a>` : ''}</p>
        </div>
        <div style="background:${overallBg};border:1px solid ${overallColor};border-radius:12px;padding:16px 24px;text-align:center">
          <div style="font-size:15px;font-weight:800;color:${overallColor}">${overallLabel}</div>
          <div style="font-size:12px;color:#64748b;margin-top:6px">${totalErrors} error(s) · ${totalWarnings} warning(s) · ${totalNotices} notice(s)</div>
        </div>
      </div>
    </div>

    <!-- Summary table -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:0;margin-bottom:20px;overflow:hidden">
      <div style="padding:18px 20px 14px;border-bottom:1px solid #e2e8f0">
        <h2 style="margin:0;font-size:15px;color:#0f172a">Pipeline Summary</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>Job</th>
            <th>Status</th>
            <th style="text-align:center">Errors</th>
            <th style="text-align:center">Warnings</th>
            <th style="text-align:center">Notices</th>
          </tr>
        </thead>
        <tbody>${summaryRows}</tbody>
      </table>
    </div>

    <!-- Per-job detail sections -->
    <h2 style="font-size:15px;color:#0f172a;margin:0 0 14px">Detailed Findings</h2>
    ${detailSections}

    <!-- Footer -->
    <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:24px">
      RUXAILAB · Integrity Pipeline · ${now}
    </p>

  </div>
</body>
</html>`

// ─── Write output ────────────────────────────────────────────────────────────

fs.mkdirSync('integrity-report', { recursive: true })
const outFile = path.join('integrity-report', 'security-report.html')
fs.writeFileSync(outFile, html, 'utf8')

console.log(`✅ Report generated: ${outFile}`)
console.log(`   Status : ${overallStatus.toUpperCase()}`)
console.log(`   Errors : ${totalErrors}`)
console.log(`   Warnings: ${totalWarnings}`)
console.log(`   Notices : ${totalNotices}`)
