const fs = require('fs')
const path = require('path')

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    return null
  }
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`
}

module.exports = async ({ github, context, core }) => {
  const workspace = process.env.GITHUB_WORKSPACE
  const reportFileName =
    process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'reliability-results.json'
  const reportPath = path.join(workspace, reportFileName)
  const dataPath = path.join(workspace, '.github', 'reliability_data.json')
  const markdownPath = path.join(workspace, '.github', 'reliability_report.md')
  const hasTests = process.env.RELIABILITY_HAS_TESTS !== 'false'
  const testCount = Number(process.env.RELIABILITY_TEST_COUNT || '0')

  const report = readJson(reportPath)
  const stats = report && report.stats ? report.stats : null
  const totalTests =
    stats && typeof stats.total === 'number'
      ? stats.total
      : (stats?.expected || 0) +
        (stats?.unexpected || 0) +
        (stats?.flaky || 0) +
        (stats?.skipped || 0)
  const passedTests = stats?.expected || 0
  const failedTests = stats?.unexpected || 0
  const flakyTests = stats?.flaky || 0
  const skippedTests = stats?.skipped || 0

  const reliabilityScore =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 1000) / 10 : 100

  const currentEntry = hasTests
    ? {
        date: new Date().toISOString().slice(0, 10),
        status: failedTests > 0 ? 'failed' : 'passed',
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        flaky: flakyTests,
        skipped: skippedTests,
        score: reliabilityScore,
      }
    : {
        date: new Date().toISOString().slice(0, 10),
        status: 'skipped',
        total: 0,
        passed: 0,
        failed: 0,
        flaky: 0,
        skipped: 0,
        score: 0,
        note: 'No Playwright tests were detected in the repository.',
      }

  let reliabilityData = readJson(dataPath)
  if (!reliabilityData) {
    reliabilityData = {
      metric_name: 'Reliability',
      group: 'RUXAILAB',
      pipeline_name: 'Reliability',
      status: currentEntry.status,
      date: currentEntry.date,
      run_id: String(context.runId),
      summary: {
        total: currentEntry.total,
        passed: currentEntry.passed,
        failed: currentEntry.failed,
        flaky: currentEntry.flaky,
        skipped: currentEntry.skipped,
        score: currentEntry.score,
      },
      history: [],
    }
  }

  reliabilityData.history = Array.isArray(reliabilityData.history)
    ? reliabilityData.history
    : []
  reliabilityData.history = reliabilityData.history.filter(
    (entry) => entry.date !== currentEntry.date,
  )
  reliabilityData.history.push({ ...currentEntry, run_id: String(context.runId) })
  reliabilityData.history.sort((left, right) =>
    left.date.localeCompare(right.date),
  )
  reliabilityData.status = currentEntry.status
  reliabilityData.date = currentEntry.date
  reliabilityData.run_id = String(context.runId)
  reliabilityData.summary = {
    total: currentEntry.total,
    passed: currentEntry.passed,
    failed: currentEntry.failed,
    flaky: currentEntry.flaky,
    skipped: currentEntry.skipped,
    score: currentEntry.score,
  }

  fs.writeFileSync(dataPath, JSON.stringify(reliabilityData, null, 2))

  const recentEntries = reliabilityData.history.slice(-7)
  let markdown = `# Reliability Report (${currentEntry.date})\n\n`
  if (!hasTests) {
    core.warning(
      `No Playwright tests were detected (${testCount} test files found). The Reliability workflow was skipped; ask the group to create tests before using this pipeline.`,
    )
    markdown += `> No Playwright tests were detected in this repository. The Reliability workflow was skipped, so there is no execution data yet.\n\n`
  }
  markdown += `| Metric | Value |\n`
  markdown += `| :-- | --: |\n`
  markdown += `| Status | ${currentEntry.status} |\n`
  markdown += `| Total tests | ${currentEntry.total} |\n`
  markdown += `| Passed | ${currentEntry.passed} |\n`
  markdown += `| Failed | ${currentEntry.failed} |\n`
  markdown += `| Flaky | ${currentEntry.flaky} |\n`
  markdown += `| Skipped | ${currentEntry.skipped} |\n`
  markdown += `| Reliability score | ${formatPercent(currentEntry.score)} |\n\n`

  markdown += `## Recent history\n\n`
  markdown += `| Date | Status | Total | Passed | Failed | Flaky | Score |\n`
  markdown += `| :-- | :-- | --: | --: | --: | --: | --: |\n`
  recentEntries.forEach((entry) => {
    markdown += `| ${entry.date} | ${entry.status} | ${entry.total} | ${entry.passed} | ${entry.failed} | ${entry.flaky} | ${formatPercent(entry.score)} |\n`
  })

  markdown += `\n## Interpretation\n\n`
  markdown += `This pipeline measures the stability of the existing E2E suite without a separate black-box layer. A lower score or any flaky failures should be treated as a reliability regression.\n`

  fs.writeFileSync(markdownPath, markdown)

  await core.summary.addRaw(markdown).write()

  core.info(`Reliability report written to ${dataPath}`)
  core.info(`Current reliability score: ${formatPercent(currentEntry.score)}`)
}
