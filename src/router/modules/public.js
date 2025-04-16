// src/router/modules/public.js
import TestView from '@/views/public/TestView.vue'
import SignIn from '@/views/public/SignInView.vue'
import SignUp from '@/views/public/SignUpView.vue'
import LandingPage from '@/views/public/LandingPageView.vue'
import PageNotFound from '@/views/public/PageNotFoundView.vue'
import Help from '@/views/public/Help.vue'

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
    path: '/help',
    name: 'Help',
    meta: { authorize: [] },
    component: Help,
  },
  {
    path: '/',
    name: 'Landing',
    meta: { authorize: [] },
    component: LandingPage,
  },
  {
    // For Vue Router 4, replace wildcard '*' with the new catch-all syntax:
    path: '/:pathMatch(.*)*',
    name: 'PageNotFound',
    meta: { authorize: [] },
    component: PageNotFound,
  },
]
