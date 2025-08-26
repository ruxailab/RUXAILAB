<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import DefaultLayout from '@/app/layouts/DefaultLayout.vue'
import NoToolbarLayout from '@/app/layouts/NoToolbarLayout.vue'

export default {
  name: 'RUXAILAB',
  computed: {
    layout() {
      const layoutName = this.$route.meta?.layout || 'default'
      const layouts = {
        default: DefaultLayout,
        'no-toolbar': NoToolbarLayout,
      }
      return layouts[layoutName] || DefaultLayout
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        document.title = 'RUXAILAB' + (to.name ? ' | ' + to.name : '')
      },
    },
  },
}
</script>
