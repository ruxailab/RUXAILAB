import TestList from '@/features/navigation/views/AdminView.vue'
import Profile from '@/features/auth/views/ProfileView.vue'
import Notification from '@/features/notifications/views/NotificationPage.vue'
import Choose from '@/features/ux_creation/Choose.vue'
import ChooseStudyMethods from '@/features/ux_creation/ChooseStudyMethods.vue'
import ChooseStudyType from '@/features/ux_creation/ChooseStudyType.vue'
import StudyDetailsForm from '@/features/ux_creation/StudyDetailsForm.vue'
import DashboardView from '@/features/dashboard/views/DashboardView.vue'

export default [
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { authorize: [1] },
    component: DashboardView,
  },
  {
    path: '/admin',
    name: 'Admin',
    meta: { authorize: [1] },
    component: TestList,
  },
  {
    path: '/profile',
    name: 'Profile',
    meta: { authorize: [1] },
    redirect: () => ({
      path: '/admin',
      query: { section: 'profile' }
    }),
  },
  {
    path: '/notifications',
    name: 'notifications',
    meta: { authorize: [1] },
    redirect: () => ({
      path: '/admin',
      query: { section: 'notifications' }
    }),
  },
  {
    path: '/choose',
    name: 'study-create-step1',
    meta: { authorize: [1] },
    component: Choose,
  },
  {
    path: '/methods',
    name: 'study-create-step2',
    meta: { authorize: [1] },
    component: ChooseStudyMethods,
  },
  {
    path: '/createtest',
    name: 'study-create-step3',
    meta: { authorize: [1] },
    component: ChooseStudyType,
  },
  {
    path: '/studydetails',
    name: 'study-create-step4',
    meta: { authorize: [1] },
    component: StudyDetailsForm,
  }
]
