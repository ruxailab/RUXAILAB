import StudyAnswer from '@/shared/models/StudyAnswer'
import Theme from './Theme'

/**
 * Answer envelope for a Focus Group study.
 *
 * Holds per-session discussion data keyed by session id, plus facilitator-
 * defined themes that can pull excerpts from any reviewed session.
 */
export default class FocusGroupStudyAnswer extends StudyAnswer {
  constructor(params = {}) {
    super(params)
    this.sessions = params.sessions ?? {}
    this.themes = (params.themes ?? []).map((theme) =>
      theme instanceof Theme ? theme : new Theme(theme),
    )
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      sessions: this.sessions,
      themes: this.themes.map((theme) => theme.toFirestore()),
    })
  }
}
