export function getTrafficLightColor(value) {
  const stops = [
    { value: 0, color: [255, 205, 210] },
    { value: 0.5, color: [255, 249, 196] },
    { value: 1, color: [200, 230, 201] },
  ]
  const clampedValue = Math.max(0, Math.min(1, value))
  const start = clampedValue <= 0.5 ? stops[0] : stops[1]
  const end = clampedValue <= 0.5 ? stops[1] : stops[2]
  const progress = (clampedValue - start.value) / (end.value - start.value)
  const channels = start.color.map((channel, index) =>
    Math.round(channel + (end.color[index] - channel) * progress),
  )
  return `rgb(${channels.join(', ')})`
}
