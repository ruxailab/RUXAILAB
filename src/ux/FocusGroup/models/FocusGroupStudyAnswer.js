import StudyAnswer from '@/shared/models/StudyAnswer'

/**
 * Answer envelope for a Focus Group study.
 *
 * Initial skeleton: holds per-session discussion data keyed by session id.
 * Expanded alongside the live-session build-out.
 */
export default class FocusGroupStudyAnswer extends StudyAnswer {
  constructor(params = {}) {
    super(params)
    this.sessions = params.sessions ?? {}
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      sessions: this.sessions,
    })
  }
}
