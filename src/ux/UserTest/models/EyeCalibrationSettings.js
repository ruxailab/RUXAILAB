export default class EyeCalibrationSettings {
    constructor(params = {}) {
        this.calibName = params.calibName || ''
        this.pointNumber = params.pointNumber || 8
        this.samplePerPoint = params.samplePerPoint || 90
        this.radius = params.radius || 20
        this.offset = params.offset || 100
        this.backgroundColor = params.backgroundColor || '#FFFFFFFF'
        this.pointColor = params.pointColor || '#000000FF'
        this.customColors = params.customColors || false
        this.models = params.models || "Linear Regression"
        this.blinkFilter = params.blinkFilter ?? true
        this.leftEyeTreshold = params.leftEyeTreshold || 5
        this.rightEyeTreshold = params.rightEyeTreshold || 5
        this.index = params.index || 0
        this.msPerCapture = params.msPerCapture || 100
        this.pattern = params.pattern || []
        this.mockPattern = params.mockPattern || []
        this.threshold = params.threshold || 200
        this.calibrations = params.calibrations || []
        this.fromDashboard = params.fromDashboard || false
    }

    toFirestore() {
        return {
            calibName: this.calibName,
            pointNumber: this.pointNumber,
            samplePerPoint: this.samplePerPoint,
            radius: this.radius,
            offset: this.offset,
            backgroundColor: this.backgroundColor,
            pointColor: this.pointColor,
            customColors: this.customColors,
            models: this.models,
            blinkFilter: this.blinkFilter,
            leftEyeTreshold: this.leftEyeTreshold,
            rightEyeTreshold: this.rightEyeTreshold,
            index: this.index,
            msPerCapture: this.msPerCapture,
            pattern: this.pattern,
            mockPattern: this.mockPattern,
            threshold: this.threshold,
            calibrations: this.calibrations,
            fromDashboard: this.fromDashboard,
        }
    }


    static fromObject(data = {}) {
        return new EyeCalibrationSettings(data)
    }
}