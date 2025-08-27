import { createAccessibilityRoutes } from './accessibilityUtils';
import AccessibilityManagerView from '@/views/admin/AccessibilityManagerView.vue';
import AutomatedAccessibilityManager from '@/views/admin/AutomatedAccessibilityManager.vue';
import AccessibilityHome from '@/views/admin/ManualAccessibility/AccessibilityHome.vue';
import EditAccessibilityTest from '@/views/admin/ManualAccessibility/AccessibilityEditTest.vue';
import AccessibilityPreviewTest from '@/views/admin/ManualAccessibility/AccessibilityPreviewTest.vue';
import AccessibilityTestAnswers from '@/views/admin/ManualAccessibility/AccessibilityAnswer.vue';
import AccessibilityTestReport from '@/views/admin/AccessibilityReport.vue';
import AccessibilityTestCooperative from '@/views/admin/ManualAccessibility/AccessibilityCooperative.vue';
import AccessibilityTestSettings from '@/views/admin/AccessibilitySettings.vue';
import AccessibilityConfig from '@/views/admin/ManualAccessibility/AccessibilityConfig.vue';
import AutomatedAccessibilityHome from '@/views/admin/AutomatedAccessibility/AutomatedAccessibilityHome.vue';
import Analyse from '@/views/admin/AutomatedAccessibility/EditTest.vue';
import AccessibilityAnswers from '@/views/admin/AutomatedAccessibility/Answers.vue';
import AccessibilityReport from '@/views/admin/AutomatedAccessibility/Report.vue';
import AccessibilityCooperation from '@/views/admin/AutomatedAccessibility/Cooperation.vue';
import AccessibilitySettings from '@/views/admin/AutomatedAccessibility/Settings.vue';

const accessibilityRoutes = [
    ...createAccessibilityRoutes(
        '/accessibility/manual',
        AccessibilityManagerView,
        [
            { path: '', name: 'AccessibilityHome', component: AccessibilityHome },
            { path: '/accessibility/manual/edit/:testId', name: 'EditAccessibilityTest', component: EditAccessibilityTest },
            { path: '/accessibility/manual/preview/:testId', name: 'AccessibilityPreviewTest', component: AccessibilityPreviewTest },
            { path: '/accessibility/manual/result/:testId', name: 'AccessibilityTestAnswers', component: AccessibilityTestAnswers },
            { path: '/accessibility/manual/report/:testId', name: 'AccessibilityTestReport', component: AccessibilityTestReport },
            { path: '/accessibility/manual/cooperative/:testId', name: 'AccessibilityTestCooperative', component: AccessibilityTestCooperative },
            { path: '/accessibility/manual/setting/:testId', name: 'AccessibilityTestSettings', component: AccessibilityTestSettings },
            { path: '/accessibility/manual/config/:testId', name: 'AccessibilityConfig', component: AccessibilityConfig }
        ]
    ),
    ...createAccessibilityRoutes(
        '/accessibility/automatic',
        AutomatedAccessibilityManager,
        [
            { path: '', name: 'AutomatedAccessibilityHome', component: AutomatedAccessibilityHome },
            { path: '/accessibility/automatic/analyse/:testId', name: 'Analyse', component: Analyse },
            { path: '/accessibility/automatic/answers/:testId', name: 'AccessibilityAnswers', component: AccessibilityAnswers },
            { path: '/accessibility/automatic/report/:testId', name: 'AccessibilityReport', component: AccessibilityReport },
            { path: '/accessibility/automatic/cooperation/:testId', name: 'AccessibilityCooperation', component: AccessibilityCooperation },
            { path: '/accessibility/automatic/settings/:testId', name: 'AccessibilitySettings', component: AccessibilitySettings }
        ]
    )
];

export default accessibilityRoutes;
