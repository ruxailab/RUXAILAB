function isBlankOptionValue(value) {
  return value === null || value === undefined || value === ''
}

function selectedOptionFromAnswer(answer) {
  if (!answer || typeof answer !== 'object') return null

  if (answer.custom && typeof answer.custom === 'object') {
    return answer.custom
  }

  if (!isBlankOptionValue(answer.text) || !isBlankOptionValue(answer.value)) {
    return {
      text: answer.text,
      value: answer.value,
      timestamp: answer.timestamp,
    }
  }

  return null
}

function findSelectedTestOption(options, answer) {
  if (!Array.isArray(options) || options.length === 0) return null

  const selected = selectedOptionFromAnswer(answer)
  if (!selected) return null

  const timestamp = selected.timestamp
  if (timestamp !== null && timestamp !== undefined) {
    const byTimestamp = options.find((option) => option?.timestamp === timestamp)
    if (byTimestamp) return byTimestamp
  }

  const text = String(selected.text || '').trim()
  if (text) {
    const byText = options.find(
      (option) => String(option?.text || '').trim() === text,
    )
    if (byText) return byText
  }

  if (!isBlankOptionValue(selected.value)) {
    return (
      options.find((option) => option?.value === selected.value) || null
    )
  }

  return null
}

export { findSelectedTestOption, isBlankOptionValue }
