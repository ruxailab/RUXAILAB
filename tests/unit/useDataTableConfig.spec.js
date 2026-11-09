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

  it('sorts session owner and created columns by the values shown', () => {
    const { headers } = useDataTableConfig(ref('sessions'), (key) => key)
    const ownerHeader = headers.value.find(({ key }) => key === 'owner')
    const createdHeader = headers.value.find(
      ({ key }) => key === 'creationDate',
    )
    const createdAt = new Date('2026-10-02T09:30:00.000Z')
    const session = {
      id: 'session-1',
      title: 'Session',
      createdAt: { toMillis: () => createdAt.getTime() },
      study: { testAdmin: { email: 'owner@example.com' } },
    }

    expect(ownerHeader.value(session)).toBe('owner@example.com')
    expect(createdHeader.value(session)).toBe(createdAt.getTime())
  })

  it('keeps study rows keyed by their document id', () => {
    const { itemValue } = useDataTableConfig(ref('myTests'), (key) => key)

    expect(itemValue({ id: 'study-id' })).toBe('study-id')
  })
})
