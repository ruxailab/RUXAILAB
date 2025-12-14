import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import Study from '../../../shared/models/Study'
import EyeCalibrationSettings from './EyeCalibrationSettings'

export default class UserStudy extends Study {
    constructor(params = {}) {
        super(params)
        this.calibrationConfig = params.calibrationConfig
            ? EyeCalibrationSettings.fromObject(params.calibrationConfig)
            : null

        this.testType = STUDY_TYPES.USER
    }

    toFirestore() {
        console.log('CALIBRATION CONFIG', this.calibrationConfig);

        return Object.assign(super.toFirestore(), {
            calibrationConfig: this.calibrationConfig?.toFirestore
                ? this.calibrationConfig.toFirestore()
                : this.calibrationConfig || null
        })
    }
}