import { describe, expect, it } from '@jest/globals'
import { csvCell, toCsvLine, toLogExportRow } from '../models/LogExportRow.js'

describe('csvCell', () => {
  it.each([
    ['plain', 'plain'],
    ['a,b', '"a,b"'],
    ['say "hi"', '"say ""hi"""'],
    ['line one\nline two', '"line one\nline two"'],
    ['=1+1', "'=1+1"],
    ['+SUM(A1)', "'+SUM(A1)"],
    ['-2+3', "'-2+3"],
    ['@cmd', "'@cmd"],
    ['\tTAB', "'\tTAB"],
    ['\r=1', '"\'\r=1"'],
    ['=A1,"x"', '"\'=A1,""x"""'],
    ['naïve café 東京', 'naïve café 東京'],
    [null, ''],
    [undefined, ''],
    [42, '42'],
  ])('writes %j as %j', (value, expected) => {
    expect(csvCell(value)).toBe(expected)
  })
})

describe('toLogExportRow', () => {
  it('keeps the common fields of an event type it does not know, with no details', () => {
    const row = toLogExportRow({
      participantLabel: 'P-012',
      eventType: 'CARD_SORT_UPDATED',
      level: 'info',
      details: { cardName: 'Private card text' },
    })
    expect(row).toMatchObject({
      participantLabel: 'P-012',
      eventType: 'CARD_SORT_UPDATED',
      details: {},
    })
  })

  it('drops malformed labels and values outside the controlled vocabularies', () => {
    const row = toLogExportRow({
      participantLabel: 'alice@example.com',
      eventType: 'not an event',
      level: 'critical',
      layer: 'anything',
      source: 'browser',
      timeQuality: 'trusted',
      message: 'Line one\nline two',
    })
    expect(row).toMatchObject({
      participantLabel: '',
      eventType: '',
      level: '',
      layer: '',
      source: '',
      timeQuality: '',
      message: 'Line one line two',
    })
  })

  it('keeps structured response items but drops free text inside them', () => {
    const row = toLogExportRow({
      eventType: 'STRUCTURED_RESPONSE_ACTIVITY',
      details: {
        scopeRef: 'task:0',
        taskType: 'nasa-tlx',
        items: [
          { itemRef: 'nasa-tlx:mentalDemand', changes: 2 },
          { itemRef: 'nasa-tlx:effort', changes: -1 },
          { itemRef: 'free text answer', changes: 1 },
          { itemRef: 'nasa-tlx:effort', changes: 1, note: 'secret' },
        ],
      },
    })
    expect(row.details).toEqual({
      scopeRef: 'task:0',
      taskType: 'nasa-tlx',
      items: [
        { itemRef: 'nasa-tlx:mentalDemand', changes: 2 },
        { itemRef: 'nasa-tlx:effort', changes: 1 },
      ],
    })
  })

  it('serializes details as JSON in the last CSV column', () => {
    const line = toCsvLine(
      toLogExportRow({
        eventType: 'TASK_ATTEMPT_FINISHED',
        details: {
          taskRef: 'task:1',
          outcome: 'completed',
          recordingTypes: ['audio', 'screen'],
          taskDurationMs: 5300,
        },
      }),
    )
    expect(line.trimEnd().split(',').slice(10).join(',')).toBe(
      '"{""taskRef"":""task:1"",""recordingTypes"":[""audio"",""screen""],""outcome"":""completed"",""taskDurationMs"":5300}"',
    )
  })
})
