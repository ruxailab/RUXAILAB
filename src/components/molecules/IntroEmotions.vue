<template>
  <div>
    <IntroComp
      :colors="['#3498db', '#2e9ecc']"
      :title="'Emotions'"
      :image="'IntroEmotions.png'"
      :main="$t('descriptions.intro.emotions')"
      :link="$t('descriptions.intro.invite')"
      :items="items"
      @linkClicked="emitLinkClicked"
      @callFunc="emitCallFunc"
    />
  </div>
</template>

<script>
import IntroComp from '@/components/atoms/IntrosComponent'
import i18n from '@/i18n'

export default {
  components: {
    IntroComp,
  },
  computed: {
    items() {
      return [
        {
          iconColor: '#4bbdaf',
          icon: 'mdi-file-document',
          title: i18n.t('pages.intros.docTitle'),
          subtitle: i18n.t('pages.intros.docSubtitle') + i18n.t('titles.answers'),
          func: 'goToDoc',
        },
        {
          iconColor: '#4bbdaf',
          icon: 'mdi-emoticon-happy',
          title: i18n.t('pages.intros.discTitle'),
          subtitle: i18n.t('pages.intros.discSubtitle'),
          func: 'goToDisc',
        },
      ]
    },
  },
  methods: {
    emitLinkClicked() {
      this.$emit('linkClicked')
    },
    emitCallFunc(func) {
      this[func]()
    },
    goToDoc() {
      this.$router.push('/emotions/documentation').catch(() => {})
    },
    goToDisc() {
      window.open('https://discord.gg/MFWNpwTq9q')
    },
  },
}
</script>

<style scoped>
.intro-container {
  text-align: center;
  padding: 20px;
}
</style>
