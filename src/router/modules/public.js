import TestView from '@/views/public/TestView.vue'
import SignIn from '@/views/public/SignInView.vue'
import SignUp from '@/views/public/SignUpView.vue'
import ForgotPassword from '@/views/public/ForgotPasswordView.vue'
import LandingPage from '@/views/public/LandingPageView.vue'
import PageNotFound from '@/views/public/PageNotFoundView.vue'
import Help from '@/views/public/Help.vue'
import Sample from '@/views/public/Sample.vue'
import TermsOfService from '@/views/public/TermsOfService.vue'
import PrivacyPolicy from '@/views/public/PrivacyPolicy.vue'
import FAQ from '@/views/public/FAQ.vue'
export default [
  {
    path: '/testview/:id/:token?',
    name: 'TestView',
    props: true,
    meta: { authorize: [] },
    component: TestView,
  },
  {
    path: '/signin',
    name: 'SignIn',
    meta: { authorize: [] },
    component: SignIn,
  },
  {
    path: '/signup',
    name: 'Sign Up',
    meta: { authorize: [] },
    component: SignUp,
  },
  {
    path: '/forgot-password',
    name: 'Forgot Password',
    meta: { authorize: [] },
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
  },
  {
    path: '/',
    name: 'Landing',
    meta: { authorize: [] },
    component: LandingPage,
  },
  {
    path: '/:catchAll(.*)',
    name: 'Page not Found',
    meta: { authorize: [] },
    component: PageNotFound,
  },
  {
    path: '/sample',
    name: 'Sample',
    meta: { authorize: [] },
    component: Sample,
  },
  {
    path: '/wacg',
    name: 'accessibility docs',
    meta: { authorize: [] },
    component: () => import('@/views/public/Documentation.vue'),
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
