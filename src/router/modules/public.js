// Every public route is split into async chunks, including auth/landing.
const SignIn = () =>
  import(/* webpackChunkName: "auth" */ '@/features/auth/views/SignInView.vue')
const SignUp = () =>
  import(/* webpackChunkName: "auth" */ '@/features/auth/views/SignUpView.vue')
const ForgotPassword = () =>
  import(
    /* webpackChunkName: "auth" */ '@/features/auth/views/ForgotPasswordView.vue'
  )
const VerifyEmailView = () =>
  import(
    /* webpackChunkName: "auth" */ '@/features/auth/views/VerifyEmailView.vue'
  )
const TestView = () =>
  import(/* webpackChunkName: "test-view" */ '@/views/public/TestView.vue')
const MobileTaskView = () =>
  import(
    /* webpackChunkName: "mobile-task" */ '@/views/public/MobileTaskView.vue'
  )
const PageNotFound = () =>
  import(
    /* webpackChunkName: "not-found" */ '@/shared/views/public/PageNotFoundView.vue'
  )
const Help = () =>
  import(/* webpackChunkName: "help" */ '@/shared/views/public/Help.vue')
const TermsOfService = () =>
  import(
    /* webpackChunkName: "legal" */ '@/features/legal/TermsOfService.vue'
  )
const PrivacyPolicy = () =>
  import(/* webpackChunkName: "legal" */ '@/features/legal/PrivacyPolicy.vue')
const FAQ = () =>
  import(/* webpackChunkName: "faq" */ '@/shared/views/public/FAQ.vue')
const InviteView = () =>
  import(/* webpackChunkName: "invite" */ '@/shared/views/public/InviteView.vue')

export default [
  {
    path: '/preview/:id',
    name: 'StudyPreview',
    props: (route) => ({ id: route.params.id, preview: true }),
    meta: { authorize: [], layout: 'no-toolbar' },
    component: TestView,
  },
  {
    path: '/testview/:id/:token?',
    name: 'TestView',
    props: true,
    meta: { authorize: [], layout: 'no-toolbar' },
    component: TestView,
  },
  {
    path: '/signin',
    name: 'SignIn',
    meta: { authorize: [], layout: 'no-toolbar' },
    component: SignIn,
  },
  {
    path: '/signup',
    name: 'Sign Up',
    meta: { authorize: [], layout: 'no-toolbar' },
    component: SignUp,
  },
  {
    path: '/forgot-password',
    name: 'Forgot Password',
    meta: { authorize: [], layout: 'no-toolbar' },
    component: ForgotPassword,
  },
  {
    path: '/verify-email',
    name: 'Verify Email',
    meta: { authorize: [], layout: 'no-toolbar' },
    component: VerifyEmailView,
  },
  {
    path: '/help',
    name: 'Help',
    meta: { authorize: [] },
    component: Help,
  },
  {
    path: '/help/all-articles',
    name: 'AllArticles',
    meta: { authorize: [] },
    component: Help,
    props: { showAllOnLoad: true },
  },
  {
    path: '/mobile-task/:studyId/:participantUid/:token',
    name: 'Mobile task',
    props: true,
    meta: { authorize: [], layout: 'no-toolbar' },
    component: MobileTaskView,
  },
  {
    path: '/:catchAll(.*)',
    name: 'Page not Found',
    meta: { authorize: [] },
    component: PageNotFound,
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    meta: { authorize: [] },
    component: TermsOfService,
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    meta: { authorize: [] },
    component: PrivacyPolicy,
  },
  {
    path: '/faq',
    name: 'FAQ',
    meta: { authorize: [] },
    component: FAQ,
  },
  {
    path: '/invite',
    name: 'Invite',
    meta: { authorize: [], layout: 'no-toolbar' },
    component: InviteView,
  },
]
