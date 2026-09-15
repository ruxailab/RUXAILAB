const DEFAULT_IGNORED_TAGS = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']

const normalizeText = (value, maxLength) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)

/**
 * Builds a serializable, size-limited representation of a web page.
 * Counts include element nodes only; scripts and styles are omitted by default.
 */
export default class WebTreeBuilder {
  constructor({
    maxDepth = 20,
    maxNodes = 5000,
    maxTextLength = 240,
    ignoredTags = DEFAULT_IGNORED_TAGS,
  } = {}) {
    this.maxDepth = maxDepth
    this.maxNodes = maxNodes
    this.maxTextLength = maxTextLength
    this.ignoredTags = new Set(ignoredTags.map((tag) => tag.toUpperCase()))
  }

  fromHtml(html, { url = '' } = {}) {
    if (typeof DOMParser === 'undefined') {
      throw new TypeError('DOMParser is not available in this environment.')
    }
    const document = new DOMParser().parseFromString(html, 'text/html')
    return this.fromDocument(document, { url })
  }

  fromDocument(document, { url = document?.location?.href || '' } = {}) {
    if (!document?.documentElement)
      throw new TypeError('A valid Document is required.')

    const state = { count: 0, truncated: false }
    const root = this._visit(document.documentElement, 0, state)

    return {
      url,
      title: document.title || '',
      nodeCount: state.count,
      truncated: state.truncated,
      maxDepth: this._treeDepth(root),
      root,
    }
  }

  async fromUrl(url, { fetcher = globalThis.fetch, requestInit = {} } = {}) {
    if (typeof fetcher !== 'function')
      throw new TypeError('A fetch implementation is required.')

    let response
    try {
      response = await fetcher(url, requestInit)
    } catch (error) {
      throw new Error(
        `Unable to fetch the page. External URLs may require a CORS-enabled backend proxy: ${error.message}`,
      )
    }
    if (!response.ok)
      throw new Error(`Unable to fetch the page (HTTP ${response.status}).`)

    return this.fromHtml(await response.text(), { url: response.url || url })
  }

  _visit(element, depth, state) {
    if (state.count >= this.maxNodes) {
      state.truncated = true
      return null
    }

    state.count += 1
    const children = [...element.children].filter(
      (child) => !this.ignoredTags.has(child.tagName),
    )
    const node = {
      tag: element.tagName.toLowerCase(),
      childCount: children.length,
      descendantCount: 0,
      attributes: this._attributes(element),
      text: this._ownText(element),
      children: [],
    }

    if (depth >= this.maxDepth) {
      if (children.length) state.truncated = true
      return node
    }

    for (const child of children) {
      const childNode = this._visit(child, depth + 1, state)
      if (!childNode) break
      node.children.push(childNode)
      node.descendantCount += childNode.descendantCount + 1
    }
    return node
  }

  _attributes(element) {
    const allowed = [
      'id',
      'class',
      'role',
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'alt',
      'title',
      'type',
      'name',
      'href',
      'lang',
      'tabindex',
    ]
    return allowed.reduce((result, name) => {
      if (element.hasAttribute(name)) {
        result[name] = normalizeText(
          element.getAttribute(name),
          this.maxTextLength,
        )
      }
      return result
    }, {})
  }

  _ownText(element) {
    const text = [...element.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent)
      .join(' ')
    return normalizeText(text, this.maxTextLength)
  }

  _treeDepth(node) {
    if (!node?.children?.length) return 0
    return 1 + Math.max(...node.children.map((child) => this._treeDepth(child)))
  }
}
