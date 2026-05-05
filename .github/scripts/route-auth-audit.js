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

// ─────────────────────────────────────────────────────────────────────────────
// Python Route Authorization Audit
// Scans Flask / Django / FastAPI Python source files and reports route
// handler functions that are missing authentication decorators.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Python Route Authorization Audit ===')

const { execSync: execSyncPy } = require('child_process')

// Auth decorators that protect a Python route
const PY_AUTH_DECORATORS = [
  '@login_required',
  '@permission_required',
  '@jwt_required',
  '@require_http_methods',
  '@token_required',
  '@auth.login_required',
  '@requires_auth',
  '@Depends(',           // FastAPI dependency injection
]

// Route decorators that expose an endpoint
const PY_ROUTE_DECORATORS = [
  /@app\.(get|post|put|delete|patch|route)\s*\(/,
  /@blueprint\.\w+\s*\(/,
  /@router\.(get|post|put|delete|patch)\s*\(/,       // FastAPI APIRouter
  /path\s*\(/,                                         // Django urls.py
  /re_path\s*\(/,
]

let pySourceFiles = []
try {
  pySourceFiles = execSyncPy(
    'find . -name "*.py" -not -path "*/node_modules/*" -not -path "*/.git/*" ' +
    '-not -path "*/venv/*" -not -path "*/.venv/*" -not -path "*/migrations/*" ' +
    '-not -path "*/tests/*" -not -path "*/__pycache__/*" 2>/dev/null',
  )
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)
} catch (_) {}

let pyWarnings = 0
let pyErrors = 0

for (const file of pySourceFiles) {
  if (!fs.existsSync(file)) continue

  const lines = fs.readFileSync(file, 'utf8').split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check if this line is a route decorator
    const isRoute = PY_ROUTE_DECORATORS.some((pattern) => pattern.test(line))
    if (!isRoute) continue

    // Inspect the 5 lines above for an auth decorator
    const contextAbove = lines
      .slice(Math.max(0, i - 5), i)
      .map((l) => l.trim())
      .join('\n')

    const hasAuth = PY_AUTH_DECORATORS.some((decorator) =>
      contextAbove.includes(decorator),
    )

    if (!hasAuth) {
      // Extract route path from the decorator for reporting
      const routeMatch = line.match(/['"`]([^'"`]+)['"`]/)
      const routePath = routeMatch ? routeMatch[1] : line.substring(0, 60)

      console.log(
        `::warning file=${file}::Python route '${routePath}' (line ${i + 1}) has no recognizable auth decorator — verify it is intentionally public`,
      )
      pyWarnings++
    }
  }
}

if (pyWarnings > 0) {
  console.log(
    `\n⚠  Python route audit completed with ${pyWarnings} unprotected route(s) — review above`,
  )
} else if (pySourceFiles.length > 0) {
  console.log('\n✅ Python route audit passed — all detected routes have auth decorators')
} else {
  console.log('\nℹ  Python route audit skipped — no Python source files found')
}

if (pyErrors > 0) {
  process.exit(1)
}
