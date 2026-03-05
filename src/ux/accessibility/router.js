// Shared Settings View
import SettingsView from '@/shared/views/SettingsView.vue';
// Shared Cooperators View
import CooperatorsView from '@/shared/views/CooperatorsView.vue';

// Manual-Accessibility-Pages(x7)
import AccessibilityManagerView from '@/ux/accessibility/view/manual/AccessibilityManagerView.vue';
import AccessibilityHome from '@/ux/accessibility/view/manual/AccessibilityHome.vue';
import AccessibilityPreviewTest from '@/ux/accessibility/view/manual/AccessibilityPreviewTest.vue';
import AccessibilityTestAnswers from '@/ux/accessibility/view/manual/AccessibilityAnswer.vue';
import AccessibilityConfig from '@/ux/accessibility/view/manual/AccessibilityConfig.vue';

// Automated-Accessibility-Pages (x8)
import AutomatedAccessibilityManager from '@/ux/accessibility/view/automatic/AutomatedAccessibilityManager.vue';
import AutomatedAccessibilityHome from '@/ux/accessibility/view/automatic/AutomatedAccessibilityHome.vue';
import AccessibilityAnswers from '@/ux/accessibility/view/automatic/Answers.vue';
import AccessibilityReport from '@/ux/accessibility/view/automatic/Report.vue';
import AccessibilityAnalyse from '@/ux/accessibility/view/automatic/EditTest.vue';
import FinalReport from '@/ux/accessibility/view/automatic/FinalReport.vue';

// AI-Assisted-Accessibility-Pages
import AIAssistedAccessibilityManager from '@/ux/accessibility/view/aiassisted/AIAssistedAccessibilityManager.vue';
import AIAssistedAccessibilityHome from '@/ux/accessibility/view/aiassisted/AIAssistedAccessibilityHome.vue';
import AIAssistedAccessibilityExamine from '@/ux/accessibility/view/aiassisted/AIAssistedAccessibilityExamine.vue';
import AIAssistedAccessibilityAnswers from '@/ux/accessibility/view/aiassisted/AIAssistedAccessibilityAnswers.vue';
import AIAssistedAccessibilityReport from '@/ux/accessibility/view/aiassisted/AIAssistedAccessibilityReport.vue';

// AI-Assisted Tools
import ChromaCheck from '@/ux/accessibility/view/aiassisted/tools/ChromaCheck.vue';
import AnchorSense from '@/ux/accessibility/view/aiassisted/tools/AnchorSense.vue';
import ImgTagTip from '@/ux/accessibility/view/aiassisted/tools/ImgTagTip.vue';

// Navigation guard
import { accessibilityGuard } from '@/ux/accessibility/guards/accessibilityGuard.js';

const accessibilityRoutes = [
    // Manual Accessibility Routes
    {
        path: '/accessibility/manual/manager/:id',
        name: 'AccessibilityManualManager',
        meta: { authorize: [0, 1] },
        component: AccessibilityManagerView,
        props: true,
        children: [
            {
                path: '/accessibility/manual/:id',
                name: 'AccessibilityHome',
                props: true,
                meta: { authorize: [0, 1] },
                component: AccessibilityHome,
            },
            {
                path: '/accessibility/manual/setting/:id',
                name: 'EditAccessibilityTest',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: SettingsView,
            },
            {
                path: '/accessibility/manual/preview/:id/:userId?/:token?',
                name: 'AccessibilityPreviewTest',
                props: true,
                meta: { authorize: [] }, // Allow public access with token
                component: AccessibilityPreviewTest,
            },
            {
                path: '/accessibility/manual/result/:id',
                name: 'AccessibilityTestAnswers',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: AccessibilityTestAnswers,
            },
            {
                path: '/accessibility/manual/cooperative/:id',
                name: 'AccessibilityTestCooperative',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: CooperatorsView,
            },
            {
                path: '/accessibility/manual/config/:id',
                name: 'AccessibilityConfig',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: AccessibilityConfig,
            },
        ],
    },
    // Standalone cooperator access route (like heuristics)
    {
        path: '/accessibility/manual/cooperator/:id/:userId?/:token?',
        name: 'AccessibilityCooperatorTest',
        props: true,
        meta: { authorize: [] }, // Allow public access with token
        component: AccessibilityPreviewTest,
    },
    // Automatic Accessibility Routes
    {
        path: '/accessibility/automatic/manager/:id',
        name: 'AccessibilityAutomaticManager',
        meta: { authorize: [0, 1] },
        component: AutomatedAccessibilityManager,
        props: true,
        children: [
            {
                path: '',
                name: 'AutomatedAccessibilityHome',
                props: true,
                meta: { authorize: [0, 1] },
                component: AutomatedAccessibilityHome,
            },
            {
                path: '/accessibility/automatic/analyse/:id',
                name: 'AccessibilityAnalyse',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: AccessibilityAnalyse,
            },
            {
                path: '/accessibility/automatic/answers/:id',
                name: 'AccessibilityAnswers',
                props: true,
                meta: { authorize: [0, 1] }, // Allow admin (0) and evaluator (1)
                component: AccessibilityAnswers,
            },
            {
                path: '/accessibility/automatic/finalreport/:id',
                name: 'AccessibilityFinalReport',
                props: true,
                meta: { authorize: [0, 1] }, // Allow admin (0) and evaluator (1)
                beforeEnter: accessibilityGuard,
                component: FinalReport,
            },
            {
                path: '/accessibility/automatic/reports/:id/:token?',
                name: 'AccessibilityReport',
                props: true,
                meta: { authorize: [] }, // Allow public access with token
                component: AccessibilityReport,
            },
            {
                path: '/accessibility/automatic/cooperation/:id',
                name: 'AccessibilityCooperation',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: CooperatorsView,
            },
            {
                path: '/accessibility/automatic/settings/:id',
                name: 'AccessibilitySettings',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: SettingsView,
            },
        ],
    },
    // Standalone cooperator access routes
    {
        path: '/accessibility/automatic/cooperator/:id/:token',
        name: 'AccessibilityAutomaticCooperatorTest',
        props: true,
        meta: { authorize: [] }, // Allow public access with token
        component: AccessibilityReport,
    },
    // AI-Assisted Accessibility Routes
    {
        path: '/accessibility/aiassisted/manager/:id',
        name: 'AccessibilityAIAssistedManager',
        meta: { authorize: [0, 1] },
        component: AIAssistedAccessibilityManager,
        props: true,
        children: [
            {
                path: '',
                name: 'AIAssistedAccessibilityHome',
                props: true,
                meta: { authorize: [0, 1] },
                component: AIAssistedAccessibilityHome,
            },
            {
                path: '/accessibility/aiassisted/examine/:id',
                name: 'AIAssistedAccessibilityExamine',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: AIAssistedAccessibilityExamine,
            },
            {
                path: '/accessibility/aiassisted/examine/:id/chroma',
                name: 'AIAssistedAccessibilityExamineChroma',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: ChromaCheck,
            },
            {
                path: '/accessibility/aiassisted/examine/:id/anchorsense',
                name: 'AIAssistedAccessibilityExamineAnchorsense',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: AnchorSense,
            },
            {
                path: '/accessibility/aiassisted/examine/:id/imgtip',
                name: 'AIAssistedAccessibilityExamineImgtip',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: ImgTagTip,
            },
            {
                path: '/accessibility/aiassisted/settings/:id',
                name: 'AIAssistedAccessibilitySettings',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: SettingsView,
            },
            {
                path: '/accessibility/aiassisted/answers/:id',
                name: 'AIAssistedAccessibilityAnswers',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: AIAssistedAccessibilityAnswers,
            },
            {
                path: '/accessibility/aiassisted/report/:id/:token?',
                name: 'AIAssistedAccessibilityReport',
                props: true,
                meta: { authorize: [] }, // Allow public access with token
                component: AIAssistedAccessibilityReport,
            },
            {
                path: '/accessibility/aiassisted/cooperation/:id',
                name: 'AIAssistedAccessibilityCooperation',
                props: true,
                meta: { authorize: [0, 1] },
                beforeEnter: accessibilityGuard,
                component: CooperatorsView,
            },
        ],
    },
    // Standalone cooperator access route for AI-Assisted
    {
        path: '/accessibility/aiassisted/cooperator/:id/:token',
        name: 'AIAssistedAccessibilityCooperatorTest',
        props: true,
        meta: { authorize: [] }, // Allow public access with token
        component: AIAssistedAccessibilityReport,
    },
];

export default accessibilityRoutes;