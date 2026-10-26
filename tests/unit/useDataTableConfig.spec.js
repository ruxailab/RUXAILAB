import { ref } from 'vue'
import { useDataTableConfig } from '@/shared/composables/useDataTableConfig'

describe('useDataTableConfig', () => {
  it('gives sessions unique row values and sortable derived columns', () => {
    const { headers, itemValue } = useDataTableConfig(
      ref('sessions'),
      (key) => key,
    )

    const firstSession = {
      id: 'halo-study',
      email: 'first@example.com',
      scheduledAt: '2026-07-01T08:38:00.000Z',
    }

    const secondSession = {
      id: 'halo-study',
      email: 'second@example.com',
      scheduledAt: '2026-07-01T08:38:00.000Z',
    }

    expect(itemValue(firstSession)).not.toBe(itemValue(secondSession))

    const statusHeader = headers.value.find(({ key }) => key === 'status')
    const sessionDateHeader = headers.value.find(
      ({ key }) => key === 'scheduledAt',
    )

    expect(
      statusHeader.value({
        ...firstSession,
        scheduledAt: '2000-01-01T00:00:00.000Z',
      }),
    ).toBe('completed')

    expect(sessionDateHeader.value(firstSession)).toBe(
      new Date(firstSession.scheduledAt).getTime(),
    )
  })

  it('keeps study rows keyed by their document id', () => {
    const { itemValue } = useDataTableConfig(ref('myTests'), (key) => key)

    expect(itemValue({ id: 'study-id' })).toBe('study-id')
  })
})
