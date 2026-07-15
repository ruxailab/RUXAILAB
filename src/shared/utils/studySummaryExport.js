import {
  STUDY_CAPABILITY,
  hasStudyCapability,
} from '@/shared/utils/studyAccessPolicy'

export async function exportStudySummary({
  study,
  user,
  answers,
  requestPdf,
  savePdf,
  notifyDenied,
}) {
  if (
    !hasStudyCapability(
      study,
      user,
      STUDY_CAPABILITY.ANSWERS_EXPORT_SUMMARY,
    )
  ) {
    notifyDenied('AccessNotAllowed.noAccess')
    return { status: 'denied' }
  }

  const pdf = await requestPdf({
    payload: {
      title: study?.testTitle || '',
      description: study?.testDescription || '',
      type: study?.testType || '',
      taskAnswers: answers,
    },
  })
  await savePdf(pdf, `${study?.testTitle || 'resume'}.pdf`)

  return { status: 'exported' }
}
