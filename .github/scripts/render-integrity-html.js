'use strict'

/**
 * render-integrity-html.js
 *
 * Reads a security/quality report JSON and generates a self-contained HTML
 * visualisation. Path resolution is environment-variable-driven so both the
 * legacy integrity-GP.yml workflow and the unified quality-pipeline.yml can
 * share this script without modification.
 *
 * Environment variables:
 *   REPORT_INPUT_DIR   — directory containing the input JSON
 *                        (default: "integrity-security-report")
 *   REPORT_OUTPUT_DIR  — directory to write the HTML file into
 *                        (default: "integrity-html-report")
 *
 * Input  : <REPORT_INPUT_DIR>/report.json
 *          (legacy fallback: <REPORT_INPUT_DIR>/security-report.json)
 * Output : <REPORT_OUTPUT_DIR>/report.html
 *          (legacy fallback: <REPORT_OUTPUT_DIR>/security-report.html)
 */

const fs = require('fs')
const path = require('path')

// ─── Path resolution ─────────────────────────────────────────────────────────

const INPUT_DIR  = process.env.REPORT_INPUT_DIR  || 'integrity-security-report'
const OUTPUT_DIR = process.env.REPORT_OUTPUT_DIR || 'integrity-html-report'

// Unified pipeline uses report.json; legacy pipeline used security-report.json
function resolveInputPath() {
  const primary = path.join(INPUT_DIR, 'report.json')
  const legacy  = path.join(INPUT_DIR, 'security-report.json')
  if (fs.existsSync(primary)) return primary
  if (fs.existsSync(legacy))  return legacy
  return primary  // will fail with a clear error below
}

const jsonPath  = resolveInputPath()
const htmlFile  = fs.existsSync(path.join(INPUT_DIR, 'report.json'))
  ? 'report.html'
  : 'security-report.html'

// ─── Load JSON ───────────────────────────────────────────────────────────────

let report
try {
  report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
} catch (err) {
  console.error(`❌ Could not read ${jsonPath}: ${err.message}`)
  process.exit(1)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const STATUS_STYLE = {
  pass:    { label: '✅ PASS',                 color: '#16a34a', bg: '#dcfce7' },
  warn:    { label: '⚠️ WARN',                 color: '#d97706', bg: '#fef3c7' },
  fail:    { label: '❌ FAIL',                 color: '#dc2626', bg: '#fee2e2' },
  unknown: { label: '❓ N/A',                  color: '#6b7280', bg: '#f3f4f6' },
}

const LEVEL_STYLE = {
  error:   { label: 'ERROR', color: '#dc2626', bg: '#fee2e2' },
  warning: { label: 'WARN',  color: '#d97706', bg: '#fef3c7' },
  notice:  { label: 'INFO',  color: '#2563eb', bg: '#eff6ff' },
}

function badge(status) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.unknown
  return `<span style="background:${s.bg};color:${s.color};border:1px solid ${s.color};
    padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px;white-space:nowrap">${s.label}</span>`
}

function chip(level) {
  const s = LEVEL_STYLE[level] || { label: level.toUpperCase(), color: '#6b7280', bg: '#f3f4f6' }
  return `<span style="background:${s.bg};color:${s.color};padding:2px 7px;border-radius:6px;
    font-size:11px;font-weight:700;letter-spacing:.3px;white-space:nowrap">${s.label}</span>`
}

function stat(value, label, color, bg) {
  return `<div style="background:${bg};border-radius:10px;padding:14px 18px;text-align:center;min-width:80px">
    <div style="font-size:28px;font-weight:800;color:${color};line-height:1">${value}</div>
    <div style="font-size:11px;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:.5px">${label}</div>
  </div>`
}

// ─── Security job section ─────────────────────────────────────────────────────

const JOB_ICONS = {
  'access-control': '🛡️',
  'route-auth':     '🔑',
  'static-scan':    '🔍',
}

function buildJobSection(job) {
  const icon = JOB_ICONS[job.id] || '📋'

  const findingsHtml = job.findings.length === 0
    ? `<p style="color:#64748b;font-style:italic;margin:0;font-size:14px">No security annotations found.</p>`
    : job.findings.map((f) => `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">
        <div style="flex-shrink:0;padding-top:1px">${chip(f.level)}</div>
        <div>
          <div style="font-family:ui-monospace,monospace;font-size:13px;color:#1e293b;word-break:break-word">${esc(f.message)}</div>
          ${f.file ? `<div style="font-size:11px;color:#94a3b8;margin-top:3px">📄 ${esc(f.file)}</div>` : ''}
        </div>
      </div>`).join('')

  return `
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
      <h2 style="margin:0;font-size:17px;color:#0f172a">${icon} ${esc(job.name)}</h2>
      ${badge(job.status)}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
      ${stat(job.errors,   'Errors',   '#dc2626', '#fee2e2')}
      ${stat(job.warnings, 'Warnings', '#d97706', '#fef3c7')}
      ${stat(job.notices,  'Notices',  '#2563eb', '#eff6ff')}
    </div>
    <div>${findingsHtml}</div>
  </div>`
}

// ─── Quality metric section ───────────────────────────────────────────────────

const QUALITY_META = {
  complexity:        { icon: '📊', name: 'Cyclomatic Complexity', metric: 'complexity',        unit: 'CC avg/fn', decimals: 0 },
  nesting:           { icon: '🌲', name: 'Nesting Depth',         metric: 'max_nesting_depth', unit: 'max depth', decimals: 0 },
  identifier_length: { icon: '🏷️', name: 'Identifier Length',     metric: 'avg_length',        unit: 'avg chars', decimals: 2 },
  fog_index:         { icon: '📖', name: 'Fog Index',             metric: 'fog_score',         unit: 'score',     decimals: 1 },
}

function qualityJobStatus(data) {
  if (!data || data.skipped) return 'unknown'
  return (data.summary && data.summary.failed_files > 0) ? 'fail' : 'pass'
}

function buildQualitySection(key, data) {
  const qm = QUALITY_META[key]
  if (!qm) return ''
  const status = qualityJobStatus(data)

  if (!data || data.skipped) {
    return `
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <h2 style="margin:0;font-size:17px;color:#0f172a">${qm.icon} ${esc(qm.name)}</h2>
      ${badge('unknown')}
    </div>
    <p style="color:#64748b;font-style:italic;margin:16px 0 0;font-size:14px">Skipped — no files analysed.</p>
  </div>`
  }

  const results = data.results || []
  const totalFiles = (data.summary && data.summary.total_files != null) ? data.summary.total_files : results.length
  const violations = results.filter((r) => r.status_code !== 'OK' && r.status_code !== 'OK!')
  const passed = totalFiles - violations.length

  const findingsHtml = violations.length === 0
    ? `<p style="color:#64748b;font-style:italic;margin:0;font-size:14px">All ${totalFiles} file(s) passed — no violations found.</p>`
    : violations.map((r) => {
        const val = r[qm.metric]
        const display = typeof val === 'number' ? val.toFixed(qm.decimals) : (val ?? '?')
        const lvl = (r.status_code === 'DANGER' || r.status_code === '⚠️ IMPROVE NAMING') ? 'error' : 'warning'
        return `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f5f9">
        <div style="flex-shrink:0;padding-top:1px">${chip(lvl)}</div>
        <div>
          <div style="font-family:ui-monospace,monospace;font-size:13px;color:#1e293b;word-break:break-word">
            ${esc(qm.metric)} = ${esc(display)} ${esc(qm.unit)} &nbsp;·&nbsp; threshold: ${esc(String(data.threshold))}
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-top:3px">📄 ${esc(r.file)}</div>
        </div>
      </div>`
      }).join('')

  return `
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
      <h2 style="margin:0;font-size:17px;color:#0f172a">${qm.icon} ${esc(qm.name)}</h2>
      ${badge(status)}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
      ${stat(totalFiles,       'Files Analysed', '#2563eb', '#eff6ff')}
      ${stat(data.threshold,   'Threshold',      '#6b7280', '#f3f4f6')}
      ${stat(violations.length,'Violations',     violations.length > 0 ? '#dc2626' : '#16a34a', violations.length > 0 ? '#fee2e2' : '#dcfce7')}
      ${stat(passed,           'Passed',         '#16a34a', '#dcfce7')}
    </div>
    <div>${findingsHtml}</div>
  </div>`
}

// ─── Assemble HTML ───────────────────────────────────────────────────────────

const { metadata: meta, overall, jobs, quality } = report

const QUALITY_ORDER = ['complexity', 'nesting', 'identifier_length', 'fog_index']

const os = STATUS_STYLE[overall.status] || STATUS_STYLE.unknown
const overallLabel = {
  pass:    '✅ ALL CHECKS PASSED',
  warn:    '⚠️ WARNINGS DETECTED',
  fail:    '❌ ISSUES FOUND',
  unknown: '❓ INCOMPLETE',
}[overall.status] || '❓ INCOMPLETE'

const runUrl = meta.repository && meta.run_id
  ? `https://github.com/${esc(meta.repository)}/actions/runs/${esc(meta.run_id)}`
  : null

// Quality rows in the summary table (shown only when quality data is present)
const qualitySummaryRows = quality
  ? QUALITY_ORDER.map((key) => {
      const qm = QUALITY_META[key]
      const data = quality[key]
      const status = qualityJobStatus(data)
      const violations = data ? (data.results || []).filter((r) => r.status_code !== 'OK' && r.status_code !== 'OK!').length : 0
      return `
  <tr>
    <td style="padding:12px 16px"><strong>${qm.icon} ${esc(qm.name)}</strong></td>
    <td style="padding:12px 16px">${badge(status)}</td>
    <td style="padding:12px 16px;text-align:center;font-weight:700;color:${violations > 0 ? '#dc2626' : '#64748b'}">${violations}</td>
    <td style="padding:12px 16px;text-align:center;color:#94a3b8">—</td>
    <td style="padding:12px 16px;text-align:center;color:#94a3b8">—</td>
  </tr>`
    }).join('')
  : ''

// Security rows in the summary table
const securitySummaryRows = jobs.map((j) => `
  <tr>
    <td style="padding:12px 16px"><strong>${JOB_ICONS[j.id] || '📋'} ${esc(j.name)}</strong></td>
    <td style="padding:12px 16px">${badge(j.status)}</td>
    <td style="padding:12px 16px;text-align:center;font-weight:700;color:${j.errors   > 0 ? '#dc2626' : '#64748b'}">${j.errors}</td>
    <td style="padding:12px 16px;text-align:center;font-weight:700;color:${j.warnings > 0 ? '#d97706' : '#64748b'}">${j.warnings}</td>
    <td style="padding:12px 16px;text-align:center;color:#64748b">${j.notices}</td>
  </tr>`).join('')

const summaryRows = qualitySummaryRows + securitySummaryRows

// Quality sections HTML
const qualitySectionsHtml = quality
  ? QUALITY_ORDER.map((key) => buildQualitySection(key, quality[key])).join('')
  : ''

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Quality &amp; Security Report — ${esc(meta.repository)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc; color: #334155; margin: 0; padding: 24px 16px; line-height: 1.5;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f1f5f9; text-align: left; padding: 10px 16px;
      font-size: 12px; color: #64748b; font-weight: 600;
      text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e2e8f0;
    }
    td { border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
  </style>
</head>
<body>
  <div style="max-width:960px;margin:0 auto">

    <!-- Header -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:28px;margin-bottom:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div>
          <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a">🔐 Quality &amp; Security Report</h1>
          <p style="margin:0;color:#64748b;font-size:13px">
            ${esc(meta.repository)}${meta.ref ? ` · ${esc(meta.ref)}` : ''}${meta.sha ? ` · <code>${esc(meta.sha.slice(0, 7))}</code>` : ''}
          </p>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:12px">
            Generated: ${esc(meta.generated_at)}
            ${runUrl ? ` · <a href="${runUrl}" style="color:#94a3b8">Run #${esc(meta.run_id)}</a>` : ''}
          </p>
        </div>
        <div style="background:${os.bg};border:1px solid ${os.color};border-radius:12px;padding:16px 24px;text-align:center">
          <div style="font-size:15px;font-weight:800;color:${os.color}">${overallLabel}</div>
          <div style="font-size:12px;color:#64748b;margin-top:6px">
            ${overall.total_errors} error(s) · ${overall.total_warnings} warning(s) · ${overall.total_notices} notice(s)
          </div>
        </div>
      </div>
    </div>

    <!-- Pipeline Summary (all 7 jobs) -->
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:20px;overflow:hidden">
      <div style="padding:18px 20px 14px;border-bottom:1px solid #e2e8f0">
        <h2 style="margin:0;font-size:15px;color:#0f172a">Pipeline Summary</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>Job</th><th>Status</th>
            <th style="text-align:center">Violations / Errors</th>
            <th style="text-align:center">Warnings</th>
            <th style="text-align:center">Notices</th>
          </tr>
        </thead>
        <tbody>${summaryRows}</tbody>
      </table>
    </div>

    ${quality ? `
    <!-- Quality Metrics -->
    <h2 style="font-size:15px;color:#0f172a;margin:0 0 14px">📐 Quality Metrics</h2>
    ${qualitySectionsHtml}
    ` : ''}

    <!-- Security Audits -->
    <h2 style="font-size:15px;color:#0f172a;margin:0 0 14px">🔒 Security Audits</h2>
    ${jobs.map(buildJobSection).join('')}

    <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:24px">
      Quality &amp; Security Pipeline · ${esc(meta.generated_at)}
    </p>
  </div>
</body>
</html>`

// ─── Write output ─────────────────────────────────────────────────────────────

fs.mkdirSync(OUTPUT_DIR, { recursive: true })
const outFile = path.join(OUTPUT_DIR, htmlFile)
fs.writeFileSync(outFile, html, 'utf8')

console.log(`✅ HTML report generated: ${outFile}`)
console.log(`   Status   : ${overall.status.toUpperCase()}`)
console.log(`   Errors   : ${overall.total_errors}`)
console.log(`   Warnings : ${overall.total_warnings}`)
console.log(`   Notices  : ${overall.total_notices}`)
