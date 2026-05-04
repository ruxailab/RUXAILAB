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

function parseEcCoverage(report) {
  const coverage = {}
  const ecTagRegex = /\[EC\]\[([^\]]+)\]\[(valid|invalid)\]/i

  const testSuites = Array.isArray(report?.testResults) ? report.testResults : []
  testSuites.forEach((suite) => {
    const assertions = Array.isArray(suite.assertionResults)
      ? suite.assertionResults
      : []

    assertions.forEach((assertion) => {
      const titleParts = Array.isArray(assertion.ancestorTitles)
        ? [...assertion.ancestorTitles, assertion.title]
        : [assertion.title]
      const fullTitle = titleParts.filter(Boolean).join(' > ')
      const match = fullTitle.match(ecTagRegex)

      if (!match) return

      const variable = match[1]
      const ecType = match[2].toLowerCase()
      const status = assertion.status || 'failed'

      if (!coverage[variable]) {
        coverage[variable] = {
          valid: { total: 0, passed: 0, failed: 0 },
          invalid: { total: 0, passed: 0, failed: 0 },
        }
      }

      coverage[variable][ecType].total += 1
      if (status === 'passed') {
        coverage[variable][ecType].passed += 1
      } else {
        coverage[variable][ecType].failed += 1
      }
    })
  })

  return coverage
}

function summarizeEcCoverage(coverage) {
  return Object.values(coverage).reduce(
    (acc, variableCoverage) => {
      acc.validTotal += variableCoverage.valid.total
      acc.validPassed += variableCoverage.valid.passed
      acc.validFailed += variableCoverage.valid.failed
      acc.invalidTotal += variableCoverage.invalid.total
      acc.invalidPassed += variableCoverage.invalid.passed
      acc.invalidFailed += variableCoverage.invalid.failed
      return acc
    },
    {
      validTotal: 0,
      validPassed: 0,
      validFailed: 0,
      invalidTotal: 0,
      invalidPassed: 0,
      invalidFailed: 0,
    },
  )
}

module.exports = async ({ github, context, core }) => {
  const workspace = process.env.GITHUB_WORKSPACE
  const reportFileName =
    process.env.RELIABILITY_RESULTS_FILE ||
    process.env.PLAYWRIGHT_JSON_OUTPUT_NAME ||
    'reliability-results.json'
  const reportPath = path.join(workspace, reportFileName)
  const dataPath = path.join(workspace, '.github', 'reliability_data.json')
  const markdownPath = path.join(workspace, '.github', 'reliability_report.md')
  const hasTests = process.env.RELIABILITY_HAS_TESTS !== 'false'
  const testCount = Number(process.env.RELIABILITY_TEST_COUNT || '0')

  const report = readJson(reportPath)
  const isPlaywrightReport = Boolean(report && report.stats)
  const isJestReport = Boolean(report && typeof report.numTotalTests === 'number')

  const totalTests = isPlaywrightReport
    ? typeof report.stats.total === 'number'
      ? report.stats.total
      : (report.stats?.expected || 0) +
        (report.stats?.unexpected || 0) +
        (report.stats?.flaky || 0) +
        (report.stats?.skipped || 0)
    : isJestReport
      ? report.numTotalTests || 0
      : 0

  const passedTests = isPlaywrightReport
    ? report.stats?.expected || 0
    : isJestReport
      ? report.numPassedTests || 0
      : 0

  const failedTests = isPlaywrightReport
    ? report.stats?.unexpected || 0
    : isJestReport
      ? report.numFailedTests || 0
      : 0

  const flakyTests = isPlaywrightReport ? report.stats?.flaky || 0 : 0
  const skippedTests = isPlaywrightReport
    ? report.stats?.skipped || 0
    : isJestReport
      ? (report.numPendingTests || 0) + (report.numTodoTests || 0)
      : 0

  const reportMissing = hasTests && !report
  const reliabilityScore = reportMissing
    ? 0
    : totalTests > 0
      ? Math.round((passedTests / totalTests) * 1000) / 10
      : 100

  const ecCoverage = isJestReport ? parseEcCoverage(report) : {}
  const ecSummary = summarizeEcCoverage(ecCoverage)

  const currentEntry = hasTests
    ? {
        date: new Date().toISOString().slice(0, 10),
        status: reportMissing || failedTests > 0 ? 'failed' : 'passed',
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        flaky: flakyTests,
        skipped: skippedTests,
        score: reliabilityScore,
        report_type: isPlaywrightReport
          ? 'playwright'
          : isJestReport
            ? 'jest'
            : 'unknown',
        note: reportMissing
          ? `Test execution did not produce ${reportFileName}.`
          : undefined,
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
        report_type: 'none',
        note: 'No test files were detected in the repository.',
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
        ec_valid_total: ecSummary.validTotal,
        ec_valid_passed: ecSummary.validPassed,
        ec_valid_failed: ecSummary.validFailed,
        ec_invalid_total: ecSummary.invalidTotal,
        ec_invalid_passed: ecSummary.invalidPassed,
        ec_invalid_failed: ecSummary.invalidFailed,
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
    ec_valid_total: ecSummary.validTotal,
    ec_valid_passed: ecSummary.validPassed,
    ec_valid_failed: ecSummary.validFailed,
    ec_invalid_total: ecSummary.invalidTotal,
    ec_invalid_passed: ecSummary.invalidPassed,
    ec_invalid_failed: ecSummary.invalidFailed,
  }

  fs.writeFileSync(dataPath, JSON.stringify(reliabilityData, null, 2))

  const recentEntries = reliabilityData.history.slice(-7)
  let markdown = `# Reliability Report (${currentEntry.date})\n\n`

  if (!hasTests) {
    core.warning(
      `No test files were detected (${testCount} test files found). The Reliability workflow was skipped; ask the group to create tests before using this pipeline.`,
    )
    markdown += `> No test files were detected in this repository. The Reliability workflow was skipped, so there is no execution data yet.\n\n`
  } else if (reportMissing) {
    core.warning(
      `Reliability report file ${reportFileName} was not generated. Marking run as failed.`,
    )
    markdown += `> The test run did not generate ${reportFileName}. The reliability status is marked as failed because execution data is incomplete.\n\n`
  }

  markdown += `| Metric | Value |\n`
  markdown += `| :-- | --: |\n`
  markdown += `| Status | ${currentEntry.status} |\n`
  markdown += `| Total tests | ${currentEntry.total} |\n`
  markdown += `| Passed | ${currentEntry.passed} |\n`
  markdown += `| Failed | ${currentEntry.failed} |\n`
  markdown += `| Flaky | ${currentEntry.flaky} |\n`
  markdown += `| Skipped | ${currentEntry.skipped} |\n`
  markdown += `| Report type | ${currentEntry.report_type || 'unknown'} |\n`
  markdown += `| Reliability score | ${formatPercent(currentEntry.score)} |\n\n`

  markdown += `## Equivalence Classes (EC) coverage\n\n`
  markdown += `| Variable | Valid EC (passed/total) | Invalid EC (passed/total) |\n`
  markdown += `| :-- | --: | --: |\n`

  const ecVariables = Object.keys(ecCoverage).sort()
  if (ecVariables.length === 0) {
    markdown += `| _No tagged EC tests found_ | 0/0 | 0/0 |\n`
  } else {
    ecVariables.forEach((variable) => {
      const data = ecCoverage[variable]
      markdown += `| ${variable} | ${data.valid.passed}/${data.valid.total} | ${data.invalid.passed}/${data.invalid.total} |\n`
    })
  }

  markdown += `\n`
  markdown += `Valid EC totals: ${ecSummary.validPassed}/${ecSummary.validTotal} passed.\n`
  markdown += `Invalid EC totals: ${ecSummary.invalidPassed}/${ecSummary.invalidTotal} passed.\n\n`

  markdown += `## Recent history\n\n`
  markdown += `| Date | Status | Total | Passed | Failed | Flaky | Score |\n`
  markdown += `| :-- | :-- | --: | --: | --: | --: | --: |\n`
  recentEntries.forEach((entry) => {
    markdown += `| ${entry.date} | ${entry.status} | ${entry.total} | ${entry.passed} | ${entry.failed} | ${entry.flaky} | ${formatPercent(entry.score)} |\n`
  })

  markdown += `\n## Interpretation\n\n`
  markdown += `This pipeline measures reliability using automated test outcomes. Prefer modeling reliability scenarios with equivalence classes (valid and invalid ECs) so each EC is covered by at least one test case. Any failure should be treated as a reliability regression.\n`

  fs.writeFileSync(markdownPath, markdown)

  await core.summary.addRaw(markdown).write()

  core.info(`Reliability report written to ${dataPath}`)
  core.info(`Current reliability score: ${formatPercent(currentEntry.score)}`)
}
