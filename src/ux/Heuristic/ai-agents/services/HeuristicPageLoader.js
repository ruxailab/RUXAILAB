import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
import WebTreeBuilder from './WebTreeBuilder'

export default class HeuristicPageLoader {
  constructor({ maxNodes = 1200, maxDepth = 18 } = {}) {
    this.builder = new WebTreeBuilder({ maxNodes, maxDepth })
  }

  async load(url, testId) {
    const page = await this.fetch(url, testId)
    return this.builder.fromHtml(page.html, { url: page.finalUrl || url })
  }

  async discover(url, testId) {
    const page = await this.fetch(url, testId)
    const finalUrl = page.finalUrl || url
    const document = new DOMParser().parseFromString(page.html, 'text/html')
    const root = new URL(finalUrl)
    root.hash = ''
    const urls = new Map([[root.href, { url: root.href, depth: 0 }]])

    document.querySelectorAll('a[href]').forEach((anchor) => {
      try {
        const child = new URL(anchor.getAttribute('href'), root)
        child.hash = ''
        if (!['http:', 'https:'].includes(child.protocol)) return
        if (child.origin !== root.origin || child.href === root.href) return
        urls.set(child.href, { url: child.href, depth: 1 })
      } catch {
        // Ignore malformed and non-navigable links.
      }
    })

    return [...urls.values()]
  }

  async fetch(url, testId) {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'fetchHeuristicPage',
        { url, testId },
      )
    return response.data
  }
}
