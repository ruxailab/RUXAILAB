import { createAccessibilityRoutes } from './accessibilityUtils';
// Manual-Accessibility-Pages(x7)
import AccessibilityManagerView from '@/ux/accessibility/view/manual/AccessibilityManagerView.vue';
import AccessibilityHome from '@/ux/accessibility/view/manual/AccessibilityHome.vue';
import EditAccessibilityTest from '@/ux/accessibility/view/manual/AccessibilityEditTest.vue';
import AccessibilityPreviewTest from '@/ux/accessibility/view/manual/AccessibilityPreviewTest.vue';
import AccessibilityTestAnswers from '@/ux/accessibility/view/manual/AccessibilityAnswer.vue';
import AccessibilityTestCooperative from '@/ux/accessibility/view/manual/AccessibilityCooperative.vue';
import AccessibilityConfig from '@/ux/accessibility/view/manual/AccessibilityConfig.vue';


// Automated-Accessibility-Pages (x7)
import AutomatedAccessibilityManager from '@/ux/accessibility/view/automatic/AutomatedAccessibilityManager.vue';
import AutomatedAccessibilityHome from '@/ux/accessibility/view/automatic/AutomatedAccessibilityHome.vue';
import Analyse from '@/ux/accessibility/view/automatic/EditTest.vue';
import AccessibilityAnswers from '@/ux/accessibility/view/automatic/Answers.vue';
import AccessibilityReport from '@/ux/accessibility/view/automatic/Report.vue';
import AccessibilityCooperation from '@/ux/accessibility/view/automatic/Cooperation.vue';
import AccessibilitySettings from '@/ux/accessibility/view/automatic/Settings.vue';

const accessibilityRoutes = [
    ...createAccessibilityRoutes(
        '/accessibility/manual',
        AccessibilityManagerView,
        [
            { path: '', name: 'AccessibilityHome', component: AccessibilityHome },
            { path: '/edit/:testId', name: 'EditAccessibilityTest', component: EditAccessibilityTest },
            { path: '/preview/:testId', name: 'AccessibilityPreviewTest', component: AccessibilityPreviewTest },
            { path: '/result/:testId', name: 'AccessibilityTestAnswers', component: AccessibilityTestAnswers },
            { path: '/cooperative/:testId', name: 'AccessibilityTestCooperative', component: AccessibilityTestCooperative },
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