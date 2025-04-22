<template>
  <IntroComp
    :colors="['#ec6618', '#f54e42']"
    :title="'Reports'"
    :image="'IntroReports.svg'"
    :main="$t('descriptions.intro.reports')"
    :link="$t('descriptions.intro.invite')"
    :items="items"
    @link-clicked="goToCoops()"
    @call-func="callFunc"
  />
</template>

<script>
import IntroComp from '@/components/atoms/IntrosComponent'
import i18n from '@/i18n'

export default {
  components: {
    IntroComp,
  },
  emits: ['goToCoops'],
  data: () => ({}),
  computed: {
    items() {
      return [
        {
          iconColor: '#ff6224',
          icon: 'mdi-file-document',
          title: i18n.global.t('pages.intros.docTitle'),
          subtitle: i18n.global.t('pages.intros.docSubtitle') + i18n.global.t('titles.reports'),
          func: 'goToDoc',
        },
      ]
    },
  },
  methods: {
    goToDoc() {
      this.$router.push('/reports/documentation').catch(() => {})
    },
    goToCoops() {
      this.$emit('goToCoops')
    },
    callFunc(func) {
      this[func]() //call item function
    },
  },
}
</script>