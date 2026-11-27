import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import TaskConfiguration from '@/ux/UserTest/components/task-steps/TaskConfiguration.vue'
import en from '@/app/plugins/locales/en.json'

const TextFieldStub = {
  props: ['rules'],
  template: '<input />',
}

const mountConfiguration = () =>
  mount(TaskConfiguration, {
    props: { modelValue: {}, selectItems: [] },
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale: 'en',
          fallbackLocale: 'en',
          messages: { en },
        }),
      ],
      stubs: {
        'v-row': { template: '<div><slot /></div>' },
        'v-col': { template: '<div><slot /></div>' },
        'v-text-field': TextFieldStub,
        'v-select': true,
        'v-list-item': true,
        'v-list-item-subtitle': true,
        'v-icon': true,
        'v-card': true,
        'v-card-title': true,
        'v-card-text': true,
      },
    },
  })

const findTimeField = (wrapper) =>
  wrapper
    .findAllComponents(TextFieldStub)
    .find((field) => field.attributes('type') === 'number')

const validate = (rules, value) => {
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) return result
  }
  return true
}

const pressKey = (input, keyCode) => {
  const event = new KeyboardEvent('keypress', { keyCode, cancelable: true })
  input.element.dispatchEvent(event)
  return event.defaultPrevented
}

describe('TaskConfiguration estimated time', () => {
  it('accepts decimal minutes such as 1.5', () => {
    const rules = findTimeField(mountConfiguration()).props('rules')

    expect(validate(rules, '1.5')).toBe(true)
    expect(validate(rules, '0.5')).toBe(true)
    expect(validate(rules, '10')).toBe(true)
  })

  it('rejects empty, zero, negative and non-numeric values', () => {
    const rules = findTimeField(mountConfiguration()).props('rules')

    expect(validate(rules, '')).toBe('Field Required')
    expect(validate(rules, '0')).toBe('Must be a positive number')
    expect(validate(rules, '-1')).toBe('Must be a positive number')
    expect(validate(rules, 'abc')).toBe('Must be a positive number')
  })

  it('steps the number input by 0.1 minutes', () => {
    const timeField = findTimeField(mountConfiguration())

    expect(timeField.attributes('min')).toBe('0.1')
    expect(timeField.attributes('step')).toBe('0.1')
  })

  it('lets one decimal point be typed', async () => {
    const input = findTimeField(mountConfiguration()).find('input')

    await input.setValue('1')
    expect(pressKey(input, 46)).toBe(false) // '.'
    expect(pressKey(input, 53)).toBe(false) // '5'
    expect(pressKey(input, 97)).toBe(true) // 'a'

    await input.setValue('1.5')
    expect(pressKey(input, 46)).toBe(true) // second '.'
  })
})
