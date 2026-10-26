import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '@/shared/models/Study'
import DiscussionTopic from './DiscussionTopic'
import FocusGroupConfig from './FocusGroupConfig'
import Stimulus from './Stimulus'

/**
 * Represents a Focus Group study.
 *
 * Inquiry-category method for moderated group discussions. Holds the discussion
 * guide (ordered topics) and session configuration.
 */
export default class FocusGroupStudy extends Study {
  constructor(params = {}) {
    super(params)

    this.testType = STUDY_TYPES.FOCUS_GROUP
    this.discussionGuide = (params.discussionGuide ?? []).map((topic) =>
      topic instanceof DiscussionTopic ? topic : new DiscussionTopic(topic),
    )
    this.config =
      params.config instanceof FocusGroupConfig
        ? params.config
        : new FocusGroupConfig(params.config ?? {})
    this.stimuli = (params.stimuli ?? []).map((stimulus) =>
      stimulus instanceof Stimulus ? stimulus : new Stimulus(stimulus),
    )
  }

  toFirestore() {
    return Object.assign(super.toFirestore(), {
      discussionGuide: this.discussionGuide.map((topic) => topic.toFirestore()),
      config: this.config.toFirestore(),
      stimuli: this.stimuli.map((stimulus) => stimulus.toFirestore()),
    })
  }
}
