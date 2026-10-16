/** Presentation rules shared by every question batch and retry. */
export const buildResponsePresentationInstructions = (locale) => {
  const responseLocale =
    typeof locale === 'string' &&
    /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(locale)
      ? locale
      : 'en'
  return `Write all user-facing comments in the language identified by locale "${responseLocale}", regardless of the website language, question language or agent instructions. Describe visible interface elements in plain language using their displayed labels. Never include HTML, CSS selectors, DOM paths, class names, element IDs, code snippets or backticks in comment or evidence. Return evidence as an empty array: visual evidence is attached separately as real browser screenshots. Only request a screenshot when it is necessary to clarify the explanation, for example to show a specific visual issue that is hard to understand from text alone. Do not attach screenshots for routine observations or when the explanation is already clear. In those cases return an empty screenshotSelector. When necessary, set screenshotSelector to a valid CSS selector from the supplied tree identifying the visible region that directly illustrates the explanation. Select a containing region when several elements need to be shown together. If no relevant region can be identified, return an empty selector. Do not claim that a screenshot proves behavior or content that is not visible.`
}
