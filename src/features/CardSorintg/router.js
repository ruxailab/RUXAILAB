export default [
  {
    path: '/cardSorting/managerview/:id',
    name: 'CardSortingManagerView',
    meta: { authorize: [0, 1] },
    component: () => import('@/features/CardSorintg/views/ManagerView.vue'),
    props: true,
    children: [
      // {
      //   path: '/cardSorting/edittest/:id',
      //   name: 'CardSortingEditTest',
      //   props: true,
      //   meta: { authorize: [0, 1] },
      //   component: EditTestView,
      // },
      // {
      //   path: '/cardSorting/settingsview/:id',
      //   name: 'CardSortingSettingsView',
      //   props: true,
      //   meta: { authorize: [0, 1] },
      //   component: SettingsView,
      // },
      // {
      //   path: '/cardSorting/cooperators/:id',
      //   name: 'CardSortingCooperatorsView',
      //   props: true,
      //   meta: { authorize: [0, 1] },
      //   component: CooperatorsView,
      // },
    ],
  },
  // {
  //   path: '/cardSorting/testview/:id/:token?',
  //   name: 'CardSortingTestView',
  //   props: true,
  //   meta: { authorize: [] },
  //   component: TestView,
  // },
]
