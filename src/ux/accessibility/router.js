import { createAccessibilityRoutes } from './accessibilityUtils';
// Shared Settings View
import SettingsView from '@/shared/views/SettingsView.vue';

// Manual-Accessibility-Pages(x7)
import AccessibilityManagerView from '@/ux/accessibility/view/manual/AccessibilityManagerView.vue';
import AccessibilityHome from '@/ux/accessibility/view/manual/AccessibilityHome.vue';
import AccessibilityPreviewTest from '@/ux/accessibility/view/manual/AccessibilityPreviewTest.vue';
import AccessibilityTestAnswers from '@/ux/accessibility/view/manual/AccessibilityAnswer.vue';
import AccessibilityTestCooperative from '@/ux/accessibility/view/manual/AccessibilityCooperative.vue';
import AccessibilityConfig from '@/ux/accessibility/view/manual/AccessibilityConfig.vue';

// Automated-Accessibility-Pages (x7)
import AutomatedAccessibilityManager from '@/ux/accessibility/view/automatic/AutomatedAccessibilityManager.vue';
import AutomatedAccessibilityHome from '@/ux/accessibility/view/automatic/AutomatedAccessibilityHome.vue';
import AccessibilityAnswers from '@/ux/accessibility/view/automatic/Answers.vue';
import AccessibilityReport from '@/ux/accessibility/view/automatic/Report.vue';
import AccessibilityCooperation from '@/ux/accessibility/view/automatic/Cooperation.vue';
import AccessibilitySettings from '@/ux/accessibility/view/automatic/Settings.vue';
import AccessibilityAnalyse from '@/ux/accessibility/view/automatic/EditTest.vue';

const accessibilityRoutes = [
    ...createAccessibilityRoutes(
        '/accessibility/manual',
        AccessibilityManagerView,
        [
            { path: ':id', name: 'AccessibilityHome', component: AccessibilityHome },
            { path: 'edit/:id', name: 'EditAccessibilityTest', component: SettingsView, props: true },
            { path: 'preview/:id', name: 'AccessibilityPreviewTest', component: AccessibilityPreviewTest },
            { path: 'result/:id', name: 'AccessibilityTestAnswers', component: AccessibilityTestAnswers },
            { path: 'cooperative/:id', name: 'AccessibilityTestCooperative', component: AccessibilityTestCooperative },
            { path: 'config/:id', name: 'AccessibilityConfig', component: AccessibilityConfig }
        ]
    ),
    ...createAccessibilityRoutes(
        '/accessibility/automatic',
        AutomatedAccessibilityManager,
        [
            { path: ':id', name: 'AutomatedAccessibilityHome', component: AutomatedAccessibilityHome },
            { path: 'analyse/:id', name: 'Analyse', component: AccessibilityAnalyse, props: true },
            { path: 'answers/:id', name: 'AccessibilityAnswers', component: AccessibilityAnswers },
            { path: 'reports/:id', name: 'AccessibilityReport', component: AccessibilityReport },
            { path: 'cooperation/:id', name: 'AccessibilityCooperation', component: AccessibilityCooperation },
            { path: 'settings/:id', name: 'AccessibilitySettings', component: SettingsView, props: true }
        ]
    )
];

export default accessibilityRoutes;