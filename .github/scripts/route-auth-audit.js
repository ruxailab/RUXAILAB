/**
 * Route Authorization Audit
 *
 * Scans all Vue Router route definition files and reports routes
 * that are missing the `authorize` meta property, which is required
 * by the router guard to enforce access control.
 *
 * Exit code 0 — audit passed (warnings may exist)
 * Exit code 1 — critical issue found (route with no meta at all in a protected module)
 */

const { execSync } = require('child_process')
const fs = require('fs')

// Routes defined here are intentionally public — skip them
const PUBLIC_PATHS = new Set([
  '/signin',
  '/signup',
  '/forgot-password',
  '/verify-email',
  '/help',
  '/terms',
  '/privacy',
  '/faq',
  '/',
  '/:pathMatch(.*)*',
])

// Route files that are expected to define protected routes
const PROTECTED_MODULES = [
  'src/router/modules/admin.js',
  'src/router/modules/superAdmin.js',
]

// Discover UX-module routers dynamically
let uxRouters = []
try {
  uxRouters = execSync('find src/ux -name "router.js" 2>/dev/null')
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)
} catch (_) {}

const PUBLIC_MODULES = ['src/router/modules/public.js']

const allFiles = [...PROTECTED_MODULES, ...uxRouters, ...PUBLIC_MODULES]

let warnings = 0
let errors = 0

for (const file of allFiles) {
  if (!fs.existsSync(file)) {
    console.log(`⚠  Skipping ${file} — file not found`)
    continue
  }

  const content = fs.readFileSync(file, 'utf8')
  const isProtectedModule = PROTECTED_MODULES.includes(file)

  // Extract each route block heuristically by finding `path:` declarations
  const pathMatches = [...content.matchAll(/path:\s*['"`]([^'"`]+)['"`]/g)]

  for (const match of pathMatches) {
    const routePath = match[1]

    if (PUBLIC_PATHS.has(routePath)) continue
    // Skip dynamic token segments (e.g. testview/:id/:token?)
    if (routePath.includes(':token')) continue

    // Inspect surrounding context (~400 chars) for authorization metadata
    const contextStart = Math.max(0, match.index - 50)
    const contextEnd = Math.min(content.length, match.index + 400)
    const context = content.slice(contextStart, contextEnd)

    const hasAuthorizeMeta = context.includes('authorize')
    const hasMetaBlock = context.includes('meta:')

    if (!hasAuthorizeMeta && !hasMetaBlock) {
      if (isProtectedModule) {
        // Protected modules should always declare authorize
        console.log(
          `::error file=${file}::Route '${routePath}' in a protected module has no 'authorize' meta — unauthorized access may be possible`,
        )
        errors++
      } else {
        console.log(
          `::warning file=${file}::Route '${routePath}' has no 'authorize' meta — verify it is intentionally public`,
        )
        warnings++
      }
    }
  }
}

if (errors > 0) {
  console.log(
    `\n❌ Route auth audit failed: ${errors} error(s), ${warnings} warning(s)`,
  )
  process.exit(1)
} else if (warnings > 0) {
  console.log(
    `\n⚠  Route auth audit completed with ${warnings} warning(s) — review the routes above`,
  )
} else {
  console.log('\n✅ Route auth audit passed — all routes have authorization metadata')
}
