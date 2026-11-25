import { shallowMount } from '@vue/test-utils'
import { QuillEditor } from '@vueup/vue-quill'
import TextareaForm from '@/shared/components/TextareaForm.vue'

jest.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

const mountForm = (modelValue, errorHandler, extraProps = {}) =>
  shallowMount(TextareaForm, {
    props: { title: 'Welcome', modelValue, ...extraProps },
    global: {
      config: { errorHandler },
      mocks: {
        $vuetify: {
          theme: { current: { colors: { 'on-surface': '#111' } } },
        },
      },
      stubs: {
        VRow: { template: '<div><slot /></div>' },
        VCol: { template: '<div><slot /></div>' },
        VCard: { template: '<div><slot /></div>' },
        VCardTitle: { template: '<div><slot /></div>' },
        VCardText: { template: '<div><slot /></div>' },
      },
    },
  })

describe('TextareaForm', () => {
  it('passes loaded and updated string content to Quill as HTML', async () => {
    const wrapper = mountForm('')
    const editor = wrapper.findComponent(QuillEditor)

    expect(editor.props('contentType')).toBe('html')
    await wrapper.setProps({
      modelValue: '<p>Hello <strong>there</strong></p>',
    })
    expect(editor.props('content')).toBe('<p>Hello <strong>there</strong></p>')
  })

  it('emits edited HTML through both existing update events', async () => {
    const wrapper = mountForm('<p>Hello</p>')
    const html = '<p>Hello <strong>world</strong></p>'

    wrapper.findComponent(QuillEditor).vm.$emit('update:content', html)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')[0]).toEqual([html])
    expect(wrapper.emitted('update:value')[0]).toEqual([html])
  })

  it('converts an existing Delta after the editor is ready', async () => {
    const delta = {
      ops: [
        { insert: 'Hello ', attributes: { bold: true } },
        { insert: 'world\n' },
      ],
    }
    const html = '<p><strong>Hello </strong>world</p>'
    const quill = {
      root: { innerHTML: html },
      setContents: jest.fn(),
    }
    const wrapper = mountForm(delta)
    const editor = wrapper.findComponent(QuillEditor)

    expect(editor.props('content')).toBe('')
    expect(editor.props('enable')).toBe(false)
    editor.vm.$emit('ready', quill)
    await wrapper.vm.$nextTick()

    expect(quill.setContents).toHaveBeenCalledWith(delta.ops, 'silent')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([html])
    await wrapper.setProps({ modelValue: html })
    expect(editor.props('content')).toBe(html)
    expect(editor.props('enable')).toBe(true)
    expect(wrapper.emitted('update:value')[0]).toEqual([html])
  })

  it('converts a Delta loaded after the editor is ready', async () => {
    const delta = { ops: [{ insert: 'Loaded later\n' }] }
    const html = '<p>Loaded later</p>'
    const quill = {
      root: { innerHTML: html },
      setContents: jest.fn(),
    }
    const wrapper = mountForm('')
    const editor = wrapper.findComponent(QuillEditor)

    editor.vm.$emit('ready', quill)
    await wrapper.setProps({ modelValue: delta })

    expect(quill.setContents).toHaveBeenCalledWith(delta.ops, 'silent')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([html])
    expect(editor.props('content')).toBe(html)
  })

  it('reports invalid stored content without replacing it', async () => {
    const errorHandler = jest.fn()
    const quill = { root: { innerHTML: '' }, setContents: jest.fn() }
    const wrapper = mountForm({ ops: [{ delete: 5 }] }, errorHandler)

    wrapper.findComponent(QuillEditor).vm.$emit('ready', quill)
    await wrapper.vm.$nextTick()

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid rich-text content: expected HTML or a Delta',
      }),
      expect.anything(),
      expect.anything(),
    )
    expect(quill.setContents).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.findComponent(QuillEditor).props('enable')).toBe(false)
  })

  it('keeps a converted Delta read-only in a template preview', async () => {
    const wrapper = mountForm({ ops: [{ insert: 'Preview\n' }] }, undefined, {
      readonly: true,
    })
    const editor = wrapper.findComponent(QuillEditor)

    editor.vm.$emit('ready', {
      root: { innerHTML: '<p>Preview</p>' },
      setContents: jest.fn(),
    })
    await wrapper.setProps({ modelValue: '<p>Preview</p>' })

    expect(editor.props('enable')).toBe(false)
    expect(editor.props('options').readOnly).toBe(true)
  })
})
