<template>
  <IntrosComponent
    :colors="['#FF3F59', '#00213f']"
    :title="'Answers'"
    :image="'IntroAnswer.svg'"
    :main="$t('descriptions.intro.answers')"
    :link="$t('descriptions.intro.invite')"
    :items="items"
    @link-clicked="goToCoops"
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

const emit = defineEmits(['goToCoops'])

const items = computed(() => [
  {
    iconColor: '#4bbdaf',
    icon: 'mdi-file-document',
    title: t('pages.intros.docTitle'),
    subtitle: t('pages.intros.docSubtitle') + t('titles.answers'),
    func: 'goToDoc',
  },
  {
    iconColor: '#4bbdaf',
    icon: 'mdi-emoticon-happy',
    title: t('pages.intros.discTitle'),
    subtitle: t('pages.intros.discSubtitle'),
    func: 'goToDisc',
  },
])

const goToCoops = () => {
  emit('goToCoops')
}

const goToDoc = () => {
  router.push('/help').catch(() => {})
}

const goToDisc = () => {
  window.open('https://discord.gg/MFWNpwTq9q')
}

const callFunc = (func) => {
  if (func === 'goToDoc') goToDoc()
  if (func === 'goToDisc') goToDisc()
}
</script>