import { gsap } from 'gsap'

export function animateFadeInUp(target, options = {}) {
  if (!target) return

  const { duration = 0.22, y = 6, ease = 'power1.out', delay = 0 } = options

  gsap.killTweensOf(target)

  gsap.fromTo(
    target,
    { autoAlpha: 0, y },
    {
      autoAlpha: 1,
      y: 0,
      duration,
      ease,
      delay,
      clearProps: 'opacity,visibility,transform',
    },
  )
}

export async function animateSplitTextLines(targets, options = {}) {
  const elements = Array.from(targets || []).filter(Boolean)
  if (!elements.length) return () => {}

  const {
    duration = 1.2,
    yPercent = 100,
    opacity = 0,
    stagger = 0.1,
    ease = 'expo.out',
  } = options

  if (document?.fonts?.ready) {
    await document.fonts.ready
  }

  gsap.set(elements, { opacity: 1 })

  let SplitText
  try {
    const mod = await import('gsap/SplitText')
    SplitText = mod.SplitText || mod.default
    if (!SplitText) throw new Error('SplitText unavailable')
    gsap.registerPlugin(SplitText)
  } catch {
    const fallback = gsap.from(elements, {
      duration,
      y: 12,
      autoAlpha: 0,
      stagger,
      ease: 'power1.out',
    })
    return () => fallback.kill()
  }

  const splits = []
  const animations = []

  for (const el of elements) {
    let splitAnim = null
    const split = SplitText.create(el, {
      type: 'words,lines',
      linesClass: 'line',
      autoSplit: true,
      mask: 'lines',
      onSplit: (self) => {
        splitAnim = gsap.from(self.lines, {
          duration,
          yPercent,
          opacity,
          stagger,
          ease,
        })
        animations.push(splitAnim)
        return splitAnim
      },
    })
    splits.push(split)
  }

  return () => {
    for (const anim of animations) {
      if (anim && typeof anim.kill === 'function') anim.kill()
    }
    for (const split of splits) {
      if (split && typeof split.revert === 'function') split.revert()
    }
  }
}
