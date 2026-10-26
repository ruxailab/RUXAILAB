export const getTemplateManagerPath = (template) => {
  const normalize = (value) => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const templateId = normalize(template?.id)
  const testType =
    normalize(template?.header?.templateType) ||
    normalize(template?.body?.testType)
  const studyType =
    normalize(template?.header?.templateSubType) ||
    normalize(template?.body?.subType) ||
    normalize(template?.body?.testType) ||
    normalize(template?.header?.templateType)

  if (!templateId || !testType) return null

  return `/${encodeURIComponent(testType)}/${encodeURIComponent(studyType)}/template/dashboard/${encodeURIComponent(templateId)}`
}

export const getTemplatePreviewPath = (template) => {
  const managerPath = getTemplateManagerPath(template)
  if (!managerPath) return null
  return managerPath.replace('/template/dashboard/', '/template/preview/')
}
