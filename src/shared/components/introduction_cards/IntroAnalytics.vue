<template>
  <IntroComp
    :colors="['#32bde7', '#2488e0']"
    :title="'Analytics'"
    :image="'IntroAnalytics.svg'"
    :main="$t('descriptions.intro.analytics')"
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
import IntroComp from '@/shared/components/introduction_cards/IntrosComponent.vue'

const router = useRouter()
const { t } = useI18n()

const emit = defineEmits(['goToCoops'])

const items = computed(() => [
  {
    iconColor: '#59b9d4',
    icon: 'mdi-file-document',
    title: t('pages.intros.docTitle'),
    subtitle: t('pages.intros.docSubtitle') + t('titles.analytics'),
    func: 'goToDoc',
  },
  {
    iconColor: '#59b9d4',
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
  window.open('https://discord.gg/MFWNpwTq9q', '_blank', 'noopener')
}

const callFunc = (func) => {
  if (func === 'goToDoc') goToDoc()
  if (func === 'goToDisc') goToDisc()
}
</script>
