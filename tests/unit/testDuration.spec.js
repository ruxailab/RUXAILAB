import {
  accumulateTotalTestTime,
  hasTestActivity,
  sumTaskTimeMs,
} from '@/ux/UserTest/utils/testDuration'

describe('test duration utilities', () => {
  it('accumulates active test time across saved segments', () => {
    const answer = { totalTestTimeMs: 3000, submitted: false }

    const nextStartedAt = accumulateTotalTestTime(answer, 1000, 4500)

    expect(answer.totalTestTimeMs).toBe(6500)
    expect(nextStartedAt).toBe(4500)
  })

  it('stops accumulating after submission', () => {
    const answer = { totalTestTimeMs: 1000, submitted: true }

    expect(accumulateTotalTestTime(answer, 1000, 3500)).toBeNull()
    expect(answer.totalTestTimeMs).toBe(3500)
  })

  it('detects saved activity when resuming an incomplete test', () => {
    expect(hasTestActivity({ consentCompleted: true, submitted: false })).toBe(
      true,
    )
    expect(hasTestActivity({ tasks: [{ attempted: true }] })).toBe(true)
    expect(hasTestActivity({ consentCompleted: true, submitted: true })).toBe(
      false,
    )
  })

  it('sums task times without changing individual task durations', () => {
    const answer = {
      tasks: {
        0: { taskTime: 1200 },
        1: { taskTime: 2300 },
      },
    }

    expect(sumTaskTimeMs(answer)).toBe(3500)
    expect(answer.tasks[0].taskTime).toBe(1200)
  })
})
