import TestView from '@/views/public/TestView.vue'
import SignIn from '@/features/auth/views/SignInView.vue'
import SignUp from '@/features/auth/views/SignUpView.vue'
import ForgotPassword from '@/features/auth/views/ForgotPasswordView.vue'
import PageNotFound from '@/shared/views/public/PageNotFoundView.vue'
import Help from '@/shared/views/public/Help.vue'
import TermsOfService from '@/features/legal/TermsOfService.vue'
import PrivacyPolicy from '@/features/legal/PrivacyPolicy.vue'
import FAQ from '@/shared/views/public/FAQ.vue'

export default [
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
    props: { showAllOnLoad: true }
  },/*
  {
    path: '/',
    name: 'Landing',
    meta: { authorize: [] },
    component: LandingPage,
  },*/
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
]
