import TestView from '@/views/public/TestView.vue'
import SignIn from '@/views/public/SignInView.vue'
import SignUp from '@/views/public/SignUpView.vue'
import Home from '@/views/public/HomeView.vue'
import LandingPage from '@/views/public/LandingPageView.vue'
import PageNotFound from '@/views/public/PageNotFoundView.vue'
import Help from '@/views/public/Help.vue'

export default [
  {
    path: '/testview/:id/:token?',
    name: 'TestView',
    props: true,
    meta:{ requiresInvitation: true }, 
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
    path: '/home',
    name: 'Home',
    meta: { authorize: [] },
    component: Home,
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
    path: '*',
    name: 'Page not Found',
    meta: { authorize: [] },
    component: PageNotFound,
  },
]
