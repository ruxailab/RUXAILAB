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

export async function animateSplitTextWords(targets, options = {}) {
  const elements = Array.from(targets || []).filter(Boolean)
  if (!elements.length) return () => {}

  const {
    duration = 2,
    opacity = 0,
    stagger = 0.1,
    ease = 'sine.out',
    container = null,
  } = options

  if (document?.fonts?.ready) {
    await document.fonts.ready
  }

  if (container) {
    gsap.set(container, { autoAlpha: 0 })
  }

  let SplitText
  try {
    const mod = await import('gsap/SplitText')
    SplitText = mod.SplitText || mod.default
    if (!SplitText) throw new Error('SplitText unavailable')
    gsap.registerPlugin(SplitText)
  } catch {
    if (container) {
      gsap.set(container, { autoAlpha: 1 })
    }
    gsap.set(elements, { opacity: 1 })
    const fallback = gsap.from(elements, {
      opacity,
      duration,
      ease,
      stagger,
    })
    return () => fallback.kill()
  }

  const splits = elements.map((el) =>
    SplitText.create(el, { type: 'words', aria: 'hidden' }),
  )

  const allWords = splits.flatMap((split) => split.words || [])
  gsap.set(elements, { opacity: 1 })
  if (container) {
    gsap.set(container, { autoAlpha: 1 })
  }

  const animation = gsap.fromTo(
    allWords,
    { opacity },
    {
      opacity: 1,
      duration,
      ease,
      stagger,
    },
  )

  return () => {
    if (animation && typeof animation.kill === 'function') animation.kill()
    for (const split of splits) {
      if (split && typeof split.revert === 'function') split.revert()
    }
    if (container) {
      gsap.set(container, { clearProps: 'visibility,opacity' })
    }
    gsap.set(elements, { clearProps: 'opacity' })
  }
}

const WELCOME_WORDS_PRESET = {
  duration: 0.85,
  stagger: 0.035,
  opacity: 0,
  ease: 'sine.out',
}

export async function animateWelcomeText(targets, container = null) {
  return animateSplitTextWords(targets, {
    ...WELCOME_WORDS_PRESET,
    container,
  })
}

const MODERATOR_LINES_PRESET = {
  duration: 1.2,
  stagger: 0.1,
  yPercent: 100,
  opacity: 0,
}

export async function animateModeratorWelcomeText(targets) {
  return animateSplitTextLines(targets, MODERATOR_LINES_PRESET)
}
