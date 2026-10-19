import { flushPromises, mount } from '@vue/test-utils'
import LogExportDialog from '@/shared/components/logs/LogExportDialog.vue'
import { downloadBlob, exportStudyLogs } from '@/shared/services/studyLogExport'

jest.mock('@/shared/services/studyLogExport', () => ({
  downloadBlob: jest.fn(),
  exportStudyLogs: jest.fn(),
}))

const stubs = {
  VBtn: {
    emits: ['click'],
    template:
      '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
  },
  VDialog: { template: '<div><slot /></div>' },
  VRadioGroup: {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template: '<fieldset :data-label="label"><slot /></fieldset>',
  },
  VRadio: {
    props: ['label', 'value'],
    template:
      '<button type="button" :data-value="value" @click="$parent.$emit(\'update:modelValue\', value)">{{ label }}</button>',
  },
}

const mountDialog = (props) =>
  mount(LogExportDialog, {
    props: { studyId: 'study-1', ...props },
    global: { stubs },
  })

const filters = {
  level: 'warning',
  occurredFrom: new Date('2026-08-14T00:00:00.000Z'),
}

describe('LogExportDialog', () => {
  beforeEach(() => {
    exportStudyLogs.mockResolvedValue({
      blob: new Blob(['x']),
      filename: 'study-study-1-logs.csv',
      rowCount: 1,
    })
  })

  it('exports the current filters by default and downloads the file', async () => {
    const wrapper = mountDialog({ filters, filterCount: 2 })

    await wrapper.find('[data-test="start-export"]').trigger('click')
    await flushPromises()

    expect(exportStudyLogs).toHaveBeenCalledWith(
      expect.objectContaining({
        studyId: 'study-1',
        format: 'csv',
        filters,
      }),
    )
    expect(downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      'study-study-1-logs.csv',
    )
  })

  it('can export the whole study as JSON instead', async () => {
    const wrapper = mountDialog({ filters, filterCount: 2 })

    await wrapper.find('[data-value="study"]').trigger('click')
    await wrapper.find('[data-value="json"]').trigger('click')
    await wrapper.find('[data-test="start-export"]').trigger('click')
    await flushPromises()

    expect(exportStudyLogs).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'json', filters: {} }),
    )
  })

  it('explains a denied export without downloading anything', async () => {
    exportStudyLogs.mockRejectedValue({ code: 'functions/permission-denied' })
    const wrapper = mountDialog()

    await wrapper.find('[data-test="start-export"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'You do not have permission to export these logs.',
    )
    expect(downloadBlob).not.toHaveBeenCalled()
  })
})
