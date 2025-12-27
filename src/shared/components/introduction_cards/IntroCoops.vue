<template>
  <IntrosComponent
    :colors="['#FF3F59', '#00213f']"
    :title="'Cooperators'"
    :image="'IntroCoops.svg'"
    :main="$t('descriptions.intro.cooperators')"
    :link="$t('descriptions.intro.start')"
    :items="items"
    @link-clicked="closeIntro"
    @call-func="callFunc"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IntrosComponent from './IntrosComponent.vue'

const router = useRouter()
const { t } = useI18n()

const emit = defineEmits(['closeIntro'])

const items = computed(() => [
  {
    iconColor: '#daf01a',
    icon: 'mdi-file-document',
    title: t('pages.intros.docTitle'),
    subtitle: t('pages.intros.docSubtitle') + t('titles.cooperators'),
    func: 'goToDoc',
  },
  {
    iconColor: '#daf01a',
    icon: 'mdi-emoticon-happy',
    title: t('pages.intros.discTitle'),
    subtitle: t('pages.intros.discSubtitle'),
    func: 'goToDisc',
  },
])

const goToDoc = () => {
  router.push('/help').catch(() => {})
}

const goToDisc = () => {
  window.open('https://discord.gg/MFWNpwTq9q')
}

const closeIntro = () => {
  emit('closeIntro')
}

const callFunc = (func) => {
  if (func === 'goToDoc') goToDoc()
  if (func === 'goToDisc') goToDisc()
}
</script>