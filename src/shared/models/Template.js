/**
 * Create a Template.
 * @param {Study} body - The Study value.
 * @param {TemplateHeader} header - The TemplateHeader value.
 */

import TemplateHeader from './TemplateHeader'

export default class Template {
  constructor({ id, header, body } = {}) {
    this.id = id
    this.header = header
    this.body = body
  }
  static toTemplate(data) {
    return new Template({
      id: data.id ?? null,
      body: data.body ?? null,
      header: TemplateHeader.toTemplateHeader(data.header),
    })
  }
  toFirestore() {
    return {
      header: this.header.toFirestore(),
      body: this.body,
    }
  }
}
