<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import NoToolbarLayout from '@/layouts/NoToolbarLayout.vue'

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
