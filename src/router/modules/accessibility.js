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
            { path: '/edit/:testId', name: 'EditAccessibilityTest', component: EditAccessibilityTest },
            { path: '/preview/:testId', name: 'AccessibilityPreviewTest', component: AccessibilityPreviewTest },
            { path: '/result/:testId', name: 'AccessibilityTestAnswers', component: AccessibilityTestAnswers },
            { path: '/report/:testId', name: 'AccessibilityTestReport', component: AccessibilityTestReport },
            { path: '/cooperative/:testId', name: 'AccessibilityTestCooperative', component: AccessibilityTestCooperative },
            { path: '/setting/:testId', name: 'AccessibilityTestSettings', component: AccessibilityTestSettings },
            { path: '/config/:testId', name: 'AccessibilityConfig', component: AccessibilityConfig }
        ]
    ),
    ...createAccessibilityRoutes(
        '/accessibility/automatic',
        AutomatedAccessibilityManager,
        [
            { path: '', name: 'AutomatedAccessibilityHome', component: AutomatedAccessibilityHome },
            { path: '/analyse/:testId', name: 'Analyse', component: Analyse },
            { path: '/answers/:testId', name: 'AccessibilityAnswers', component: AccessibilityAnswers },
            { path: '/reports/:testId', name: 'AccessibilityReport', component: AccessibilityReport },
            { path: '/cooperation/:testId', name: 'AccessibilityCooperation', component: AccessibilityCooperation },
            { path: '/settings/:testId', name: 'AccessibilitySettings', component: AccessibilitySettings }
        ]
    )
];

export default accessibilityRoutes;
