import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '@/shared/models/Study'

/**
 * Represents a Focus Group study.
 *
 * Inquiry-category method for moderated group discussions. This is the initial
 * skeleton model; discussion-specific fields (guide, stimuli, sessions) will be
 * added as the build-out phase progresses.
 */
export default class FocusGroupStudy extends Study {
  constructor(params = {}) {
    super(params)

    this.testType = STUDY_TYPES.FOCUS_GROUP
    this.discussionGuide = params.discussionGuide ?? []
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      discussionGuide: this.discussionGuide,
    })
  }
}
