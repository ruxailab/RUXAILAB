<template>
  <v-card elevation="2" rounded="lg" class="mb-6">
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-post" class="me-2" color="primary" style="padding:1.5rem"></v-icon>
        Latest Blog Posts
      </div>
      <div class="d-flex align-center ga-2">
        <v-btn variant="text" size="small" color="primary" :href="blogUrl" target="_blank">View Blog</v-btn>
        <v-progress-circular v-if="loading" indeterminate size="20" color="primary" />
      </div>
    </v-card-title>

    <v-card-text class="py-4">
      <v-alert v-if="error" type="warning" variant="tonal" density="compact" class="mb-4">{{ error }}</v-alert>
      <v-list v-if="!loading" class="py-0">
        <v-list-item v-for="(post, index) in blogPosts" :key="post.id || index" :href="post.url" target="_blank" class="blog-post-item" :class="{ 'border-bottom': index < blogPosts.length - 1 }">
          <v-list-item-title class="text-body-1 font-weight-medium mb-1">{{ post.title }}</v-list-item-title>
          <div v-if="post.excerpt" class="excerpt text-body-2 text-medium-emphasis mb-2" :title="post.excerpt">{{ post.excerpt }}</div>
          <div class="d-flex align-center justify-space-between">
            <span class="text-caption text-medium-emphasis">{{ post.displayDate }}</span>
            <v-icon icon="mdi-open-in-new" size="16" color="primary" />
          </div>
        </v-list-item>
      </v-list>
      <div v-else class="px-2 py-4">
        <v-skeleton-loader type="list-item-two-line" class="mb-2" v-for="n in 3" :key="n" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  limit: { type: Number, default: 5 },
  blogUrl: { type: String, default: 'https://blog-ruxailab.web.app/' },
  githubRepo: { type: String, default: 'ruxailab/blog' },
  githubPostsDir: { type: String, default: 'posts' }
})

const blogPosts = ref([])
const loading = ref(false)
const error = ref('')

const fallbackPosts = [ { title: 'RUXAILAB Blog', url: props.blogUrl, date: '', displayDate: '' } ]

function parseDate(str) {
  if (!str) return null
  const cleaned = str.replace(/^(Published on|Fecha|Date)[:\-]?\s*/i, '').trim()
    .replace(/\*|\_/g, '') // remove markdown emphasis
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d
  // Try YYYY-MM-DD inside string
  const iso = cleaned.match(/(\d{4}-\d{2}-\d{2})/)
  if (iso) {
    const d2 = new Date(iso[1])
    if (!isNaN(d2.getTime())) return d2
  }
  return null
}

function toDisplayDate(d) {
  if (!d) return ''
  const now = new Date()
  const diffMs = now - d
  const diffDays = diffMs / 86400000
  if (diffDays < 1) {
    const diffH = Math.floor(diffMs / 3600000)
    if (diffH <= 1) return 'hace 1h'
    return `hace ${diffH}h`
  }
  if (diffDays < 7) return `hace ${Math.floor(diffDays)}d`
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

function enrichPosts(raw) {
  const enriched = raw.map((p, i) => {
    const dateObj = parseDate(p.date)
    return {
      ...p,
      id: p.id || i + 1,
      _dateObj: dateObj,
      displayDate: p.displayDate || toDisplayDate(dateObj) || p.date || ''
    }
  })
  // Sort newest first
  enriched.sort((a, b) => {
    const ta = a._dateObj ? a._dateObj.getTime() : 0
    const tb = b._dateObj ? b._dateObj.getTime() : 0
    return tb - ta
  })
  return enriched
}

async function fetchJsonIndex() {
  try {
    const res = await fetch(props.blogUrl + 'posts.json', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data)) return null
    return enrichPosts(data).slice(0, props.limit)
  } catch { return null }
}

async function fetchGithubDirectory() {
  try {
    const api = `https://api.github.com/repos/${props.githubRepo}/contents/${props.githubPostsDir}`
    const res = await fetch(api, { headers: { 'Accept': 'application/vnd.github+json' } })
    if (!res.ok) throw new Error('GitHub API ' + res.status)
    const list = await res.json()
    const files = list.filter(f => f.type === 'file' && /\.(md|markdown)$/i.test(f.name))

    const posts = await Promise.all(files.map(async (file) => {
      try {
        const rawRes = await fetch(file.download_url)
        if (!rawRes.ok) return null
        const text = await rawRes.text()
        // Front matter
        let frontMatter = ''
        const fmMatch = text.match(/^---\n([\s\S]*?)\n---/)
        if (fmMatch) frontMatter = fmMatch[1]
        const fmDate = frontMatter.match(/date:\s*(.+)/)
        const fmTitle = frontMatter.match(/title:\s*(.+)/)
        let date = fmDate ? fmDate[1].trim() : ''
        const titleFromFM = fmTitle ? fmTitle[1].trim().replace(/^"|"$/g, '') : ''
        const titleMatch = text.match(/^#\s+(.+)/m)
        const headingTitle = titleMatch ? titleMatch[1].trim() : ''
        const title = titleFromFM || headingTitle || file.name.replace(/\.(md|markdown)$/i, '')
        if (!date) {
          const pub = text.match(/Published on[:\-]?\s*(.*)/i)
          if (pub) date = pub[1].trim().split('\n')[0]
        }
        // Remove front matter & title to get body
        let body = text
          .replace(/^---[\s\S]*?---/, '')
          .replace(/^#\s+.*$/m, '')
          .trim()
        // Strip images & HTML tags
        body = body.replace(/<img[\s\S]*?>/gi, ' ').replace(/<[^>]+>/g, ' ')
        // First meaningful paragraph
        const paragraphs = body.split(/\n{2,}/).map(p => p
          .replace(/^[>\-*\d+\.\s]+/gm, '')
          .replace(/[`*_#]|\!\[[^\]]*\]|\[[^\]]*\]\([^)]*\)/g, '')
          .replace(/\s+/g, ' ')
          .trim())
          .filter(p => p.length > 30)
        let excerpt = paragraphs[0] || ''
        if (excerpt.length > 220) excerpt = excerpt.slice(0, 217) + '…'
        const baseName = file.name.replace(/\.(md|markdown)$/i, '')
        const url = props.blogUrl + 'posts/' + baseName + '.html'
        return { title, url, date, excerpt }
      } catch { return null }
    }))

    const filtered = posts.filter(Boolean)
    return enrichPosts(filtered).slice(0, props.limit)
  } catch (e) {
    console.warn('GitHub fetch failed', e)
    return null
  }
}

async function fetchBlogPosts() {
  if (props.posts.length) { blogPosts.value = enrichPosts(props.posts); return }
  loading.value = true
  error.value = ''
  try {
    let data = await fetchJsonIndex()
    if (!data) data = await fetchGithubDirectory()
    if (!data || !data.length) throw new Error('Sin posts')
    blogPosts.value = data.slice(0, props.limit)
  } catch (e) {
    error.value = 'No se pudieron cargar los posts.'
    blogPosts.value = fallbackPosts
  } finally { loading.value = false }
}

onMounted(fetchBlogPosts)
</script>

<style scoped>
.blog-post-item { padding: 2rem 1.5rem; }
.border-bottom { border-bottom: 1px solid rgb(var(--v-theme-outline-variant)); }
:deep(.v-list-item__content) { padding: 0; }
:deep(.v-list-item-title) { white-space: normal; line-height: 1.4; }
.excerpt { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
