<template>
  <component :is="layout">
    <ErrorBoundary>
      <router-view />
    </ErrorBoundary>
  </component>
</template>

<script>
import DefaultLayout from '@/app/layouts/DefaultLayout.vue'
import NoToolbarLayout from '@/app/layouts/NoToolbarLayout.vue'
import ErrorBoundary from '@/shared/components/ErrorBoundary.vue'

export default {
  name: 'RUXAILAB',
  components: {
    ErrorBoundary,
  },
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

