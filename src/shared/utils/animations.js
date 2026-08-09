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
    container = null,
  } = options

  if (document?.fonts?.ready) {
    await document.fonts.ready
  }

  if (container) {
    gsap.set(container, { autoAlpha: 0 })
  }

  gsap.set(elements, { opacity: 1 })

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
    const fallback = gsap.from(elements, {
      duration,
      y: 12,
      autoAlpha: 0,
      stagger,
      ease: 'power1.out',
    })
    return () => fallback.kill()
  }

  if (container) {
    gsap.set(container, { autoAlpha: 1 })
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
    if (container) {
      gsap.set(container, { clearProps: 'visibility,opacity' })
    }
    gsap.set(elements, { clearProps: 'opacity' })
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

const WELCOME_LINES_PRESET = {
  duration: 0.9,
  stagger: 0.1,
  yPercent: 100,
  opacity: 0,
  ease: 'expo.out',
}

export async function animateWelcomeText(targets, container = null) {
  return animateSplitTextLines(targets, {
    ...WELCOME_LINES_PRESET,
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

export async function animateStepAnnouncement(target, options = {}) {
  if (!target) return

  const root = target.$el || target
  if (!root || typeof root.querySelector !== 'function') return

  const {
    totalDuration = 5,
    enterDuration = 0.75,
    exitDuration = 0.85,
    easeIn = 'sine.out',
    easeOut = 'sine.inOut',
  } = options

  const card = root.querySelector('.step-announcement-card')
  const title = card?.querySelector('h1') || root.querySelector('h1')
  const kicker = card?.querySelector('p') || root.querySelector('p')
  const holdDuration = Math.max(0, totalDuration - enterDuration - exitDuration)

  gsap.killTweensOf([root, card, title, kicker])

  gsap.set(root, { autoAlpha: 0 })
  if (card) gsap.set(card, { y: 16, scale: 0.992, autoAlpha: 0 })
  if (title) gsap.set(title, { y: 24, autoAlpha: 0 })
  if (kicker) gsap.set(kicker, { y: 34, autoAlpha: 0 })

  await new Promise((resolve) => {
    const timeline = gsap.timeline({ onComplete: resolve })

    timeline.to(root, {
      autoAlpha: 1,
      duration: Math.min(0.55, enterDuration),
      ease: easeIn,
    })

    if (card) {
      timeline.to(
        card,
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: enterDuration,
          ease: easeIn,
        },
        0.06,
      )
    }

    if (title) {
      timeline.to(
        title,
        {
          y: 0,
          autoAlpha: 1,
          duration: enterDuration * 0.72,
          ease: easeIn,
        },
        0.12,
      )
    }

    if (kicker) {
      timeline.to(
        kicker,
        {
          y: 0,
          autoAlpha: 1,
          duration: enterDuration * 0.7,
          ease: easeIn,
        },
        0.28,
      )
    }

    if (holdDuration > 0) {
      timeline.to({}, { duration: holdDuration })
    }

    timeline.to(
      [title, kicker],
      {
        y: -4,
        autoAlpha: 0,
        duration: exitDuration * 0.8,
        ease: easeOut,
      },
      '>',
    )

    if (card) {
      timeline.to(
        card,
        {
          y: -14,
          scale: 0.994,
          autoAlpha: 0,
          duration: exitDuration,
          ease: easeOut,
        },
        '<',
      )
    }

    timeline.to(
      root,
      {
        autoAlpha: 0,
        duration: Math.min(0.7, exitDuration),
        ease: easeOut,
      },
      '<',
    )
  })
}
