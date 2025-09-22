import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '../../../shared/models/Study'
import EyeCalibrationSettings from './EyeCalibrationSettings'

export default class UserStudy extends Study {
    constructor(params = {}) {
        super(params)
        this.calibrationConfig = new EyeCalibrationSettings(params.calibrationConfig) || new EyeCalibrationSettings()
        this.testType = STUDY_TYPES.USER
    }

    toFirestore() {
        return Object.assign(super.toFirestore(), {
            calibrationConfig: this.calibrationConfig.toFirestore ? this.calibrationConfig.toFirestore() : this.calibrationConfig
        });
    }
}