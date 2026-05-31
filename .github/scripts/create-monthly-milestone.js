// .github/scripts/create-monthly-milestone.js
// =============================================================
// Bot-driven monthly milestone creator with Discord notification.
// Designed for actions/github-script@v7 — receives { github, context, core }.
//
// Redundancy layers:
//   1. YAML parsing: npm "yaml" package → line-by-line fallback → hardcoded defaults
//   2. Milestone creation: POST create → on 422, GET + PATCH update (idempotent)
//   3. Discord webhook: retry 3× with exponential backoff → warn on final failure
// =============================================================

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ── Hardcoded fallback objectives (last resort) ─────────────────────────────
const HARDCODED_OBJECTIVES = [
  'Review and triage open issues',
  'Merge approved pull requests',
  'Update project documentation',
  'Improve test coverage',
];

// ── Month utilities ─────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Resolve the target month index (0-based) and year from workflow_dispatch
 * inputs, falling back to the current UTC date.
 */
function resolveMonthYear(core) {
  const inputMonth = (process.env.INPUT_MONTH || '').trim();
  const inputYear = (process.env.INPUT_YEAR || '').trim();

  const now = new Date();
  let month = now.getUTCMonth(); // 0-based
  let year = now.getUTCFullYear();

  if (inputMonth) {
    const idx = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === inputMonth.toLowerCase()
    );
    if (idx !== -1) {
      month = idx;
    } else {
      core.warning(
        `Invalid month input "${inputMonth}". Falling back to current month (${MONTH_NAMES[month]}).`
      );
    }
  }

  if (inputYear) {
    const parsed = parseInt(inputYear, 10);
    if (!isNaN(parsed) && parsed >= 2020 && parsed <= 2100) {
      year = parsed;
    } else {
      core.warning(
        `Invalid year input "${inputYear}". Falling back to current year (${year}).`
      );
    }
  }

  return { month, year };
}

/**
 * Returns the last day of a given month (1-indexed day).
 */
function lastDayOfMonth(year, month) {
  // month is 0-based; Date with day 0 of next month = last day of this month
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

// ── YAML parsing with fallback ──────────────────────────────────────────────

/**
 * Try to load the "yaml" npm package. Returns null if unavailable.
 */
function tryRequireYaml(core) {
  try {
    return require('yaml');
  } catch {
    core.warning(
      'Could not load "yaml" npm package. Using built-in fallback parser.'
    );
    return null;
  }
}

/**
 * Permissive line-by-line parser for our specific milestone-config.yml structure.
 * Handles only the flat structure we expect — NOT a general YAML parser.
 *
 * Expected structure:
 *   default_objectives:
 *     - "text"
 *   milestones:
 *     "Key Name":
 *       - "text"
 */
function fallbackParseYaml(content, core) {
  const result = { default_objectives: [], milestones: {} };

  const lines = content.split('\n');
  let currentSection = null; // 'default_objectives' | 'milestones'
  let currentMilestoneKey = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');

    // Skip empty lines and comments
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue;

    // Top-level keys (no indentation)
    if (/^default_objectives:\s*$/.test(line)) {
      currentSection = 'default_objectives';
      currentMilestoneKey = null;
      continue;
    }
    if (/^milestones:\s*$/.test(line)) {
      currentSection = 'milestones';
      currentMilestoneKey = null;
      continue;
    }

    // Milestone sub-key (indented key): e.g. "June 2026": or 'June 2026': or June 2026:
    if (currentSection === 'milestones') {
      const keyMatch = line.match(/^\s+["']?([^"']+)["']?:\s*$/);
      if (keyMatch) {
        currentMilestoneKey = keyMatch[1].trim();
        result.milestones[currentMilestoneKey] = [];
        continue;
      }
    }

    // List items starting with "-"
    const itemMatch = line.match(/^\s*-\s+["']?([^"']+)["']?\s*$/);
    if (itemMatch) {
      const value = itemMatch[1].trim();
      if (currentSection === 'default_objectives' && !currentMilestoneKey) {
        result.default_objectives.push(value);
      } else if (
        currentSection === 'milestones' &&
        currentMilestoneKey &&
        result.milestones[currentMilestoneKey]
      ) {
        result.milestones[currentMilestoneKey].push(value);
      }
    }
  }

  core.info(
    `Fallback parser: found ${result.default_objectives.length} default objectives, ` +
      `${Object.keys(result.milestones).length} milestone entries.`
  );

  return result;
}

/**
 * Read and parse milestone-config.yml with layered fallbacks.
 */
function loadConfig(core) {
  const configPath = path.join(process.cwd(), 'milestone-config.yml');

  // Layer 1: try to read the file
  let rawContent;
  try {
    rawContent = fs.readFileSync(configPath, 'utf8');
    core.info(`Loaded config from ${configPath}`);
  } catch (err) {
    core.warning(
      `Could not read milestone-config.yml (${err.message}). Using hardcoded defaults.`
    );
    return { default_objectives: HARDCODED_OBJECTIVES, milestones: {} };
  }

  // Layer 2: try npm yaml package
  const yamlLib = tryRequireYaml(core);
  if (yamlLib) {
    try {
      const parsed = yamlLib.parse(rawContent);
      if (parsed && typeof parsed === 'object') {
        core.info('Config parsed successfully with yaml library.');
        return {
          default_objectives:
            parsed.default_objectives || HARDCODED_OBJECTIVES,
          milestones: parsed.milestones || {},
        };
      }
    } catch (err) {
      core.warning(
        `yaml library parse error: ${err.message}. Trying fallback parser.`
      );
    }
  }

  // Layer 3: fallback line-by-line parser
  try {
    const parsed = fallbackParseYaml(rawContent, core);
    return {
      default_objectives:
        parsed.default_objectives.length > 0
          ? parsed.default_objectives
          : HARDCODED_OBJECTIVES,
      milestones: parsed.milestones || {},
    };
  } catch (err) {
    core.warning(
      `Fallback parser failed: ${err.message}. Using hardcoded defaults.`
    );
    return { default_objectives: HARDCODED_OBJECTIVES, milestones: {} };
  }
}

// ── Discord webhook with retry ──────────────────────────────────────────────

/**
 * Send a JSON payload to a URL via POST. Returns a Promise.
 */
function httpPost(url, payload) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const transport = urlObj.protocol === 'https:' ? https : http;
    const data = JSON.stringify(payload);

    const req = transport.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }
    );

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

/**
 * Sleep for the given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Post a Discord webhook embed with up to 3 retries and exponential backoff.
 */
async function postToDiscord(webhookUrl, embed, core) {
  const payload = { embeds: [embed] };
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      core.info(`Discord webhook attempt ${attempt}/${maxRetries}...`);
      const res = await httpPost(webhookUrl, payload);

      // Discord returns 204 No Content on success
      if (res.status >= 200 && res.status < 300) {
        core.info(`Discord notification sent successfully (HTTP ${res.status}).`);
        return true;
      }

      // Rate limited — respect Retry-After header if available
      if (res.status === 429) {
        let retryAfter = 2000 * attempt; // fallback backoff
        const headerValue = res.headers && (res.headers['retry-after'] || res.headers['x-ratelimit-reset-after']);
        if (headerValue) {
          const parsed = parseFloat(headerValue);
          if (!isNaN(parsed)) {
            // Discord rate limit headers are in seconds, let's convert to ms and add buffer
            retryAfter = Math.ceil(parsed * 1000) + 500;
          }
        }
        core.warning(
          `Discord rate limited (429). Retrying in ${retryAfter}ms...`
        );
        await sleep(retryAfter);
        continue;
      }

      // Server error — retry
      if (res.status >= 500) {
        core.warning(
          `Discord server error (${res.status}). Retrying in ${1000 * attempt}ms...`
        );
        await sleep(1000 * attempt);
        continue;
      }

      // Client error (4xx other than 429) — do not retry
      core.warning(
        `Discord webhook failed with HTTP ${res.status}: ${res.body}`
      );
      return false;
    } catch (err) {
      core.warning(
        `Discord webhook network error on attempt ${attempt}: ${err.message}`
      );
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      }
    }
  }

  core.warning('Discord webhook: all retries exhausted. Skipping notification.');
  return false;
}

// ── Main entry point ────────────────────────────────────────────────────────

module.exports = async ({ github, context, core }) => {
  // 1. Resolve target month & year
  const { month, year } = resolveMonthYear(core);
  const monthName = MONTH_NAMES[month];
  const milestoneTitle = `${monthName} ${year}`;
  const lastDay = lastDayOfMonth(year, month);
  // Set predictable time component matching GitHub's default stored value (08:00:00Z)
  const dueDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T08:00:00Z`;

  core.info(`Target milestone: "${milestoneTitle}" (due ${dueDate})`);

  // 2. Load config & resolve objectives
  const config = loadConfig(core);
  const objectives =
    config.milestones[milestoneTitle] ||
    config.default_objectives ||
    HARDCODED_OBJECTIVES;

  core.info(`Objectives (${objectives.length}): ${objectives.join(', ')}`);

  // 3. Build milestone description (Markdown)
  const description = [
    `## 🎯 Objectives for ${milestoneTitle}`,
    '',
    ...objectives.map((obj) => `- [ ] ${obj}`),
    '',
    '---',
    `_This milestone was automatically created by the Monthly Milestone Bot on ${new Date().toISOString().split('T')[0]}._`,
  ].join('\n');

  // 4. Create or update GitHub Milestone
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  let milestoneNumber;
  let milestoneUrl;
  let wasUpdated = false;

  try {
    // Try to create
    const { data: created } = await github.rest.issues.createMilestone({
      owner,
      repo,
      title: milestoneTitle,
      description,
      due_on: dueDate,
      state: 'open',
    });
    milestoneNumber = created.number;
    milestoneUrl = created.html_url;
    core.info(`✅ Milestone #${milestoneNumber} created: ${milestoneUrl}`);
  } catch (createErr) {
    // Inspect if the error is specifically a duplicate/already_exists error
    const isAlreadyExists =
      createErr.status === 422 &&
      (createErr.response?.data?.errors?.some(e => e.code === 'already_exists') ||
       (createErr.message && createErr.message.includes('already_exists')));

    if (isAlreadyExists) {
      core.info(
        `Milestone "${milestoneTitle}" already exists. Searching to update...`
      );

      // Paginate all pages of milestones to reliably find the existing one
      const existingMilestones = await github.paginate(
        github.rest.issues.listMilestones,
        {
          owner,
          repo,
          state: 'all',
          per_page: 100,
        }
      );

      const existing = existingMilestones.find(
        (m) => m.title === milestoneTitle
      );

      if (existing) {
        const { data: updated } = await github.rest.issues.updateMilestone({
          owner,
          repo,
          milestone_number: existing.number,
          description,
          due_on: dueDate,
          state: 'open',
        });
        milestoneNumber = updated.number;
        milestoneUrl = updated.html_url;
        wasUpdated = true;
        core.info(
          `✅ Milestone #${milestoneNumber} updated: ${milestoneUrl}`
        );
      } else {
        core.setFailed(
          `GitHub returned 422 (already_exists) but could not find milestone "${milestoneTitle}" during pagination.`
        );
        return;
      }
    } else {
      core.setFailed(
        `Failed to create milestone (Validation Error): ${createErr.message || createErr}`
      );
      return;
    }
  }

  // 5. Discord notification
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    core.warning(
      'DISCORD_WEBHOOK_URL secret is not set. Skipping Discord notification.'
    );
    core.info('Done. Milestone created/updated successfully without Discord notification.');
    return;
  }

  const actionVerb = wasUpdated ? 'Updated' : 'Created';
  const embedColor = wasUpdated ? 0xffa500 : 0x2ecc71; // orange for update, green for create

  const embed = {
    title: `📅 ${milestoneTitle} — Monthly Milestone ${actionVerb}`,
    description: [
      `A new milestone has been ${actionVerb.toLowerCase()} for **${milestoneTitle}**.`,
      '',
      '**🎯 Objectives:**',
      ...objectives.map((obj) => `• ${obj}`),
      '',
      `**📆 Due Date:** ${lastDay}/${String(month + 1).padStart(2, '0')}/${year}`,
      '',
      `🔗 [View Milestone on GitHub](${milestoneUrl})`,
    ].join('\n'),
    color: embedColor,
    footer: {
      text: `RUXAILAB • Monthly Milestone Bot`,
    },
    timestamp: new Date().toISOString(),
  };

  await postToDiscord(webhookUrl, embed, core);

  core.info(`🎉 Done! Milestone "${milestoneTitle}" ${actionVerb.toLowerCase()} and Discord notified.`);
};
