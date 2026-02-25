<template>
  <UserTestEditTestView
    v-if="previewKind === 'moderated' || previewKind === 'unmoderated'"
    :is-template="true"
    :template-test="templateTestPayload"
  />
  <HeuristicEditTest
    v-else-if="previewKind === 'heuristic'"
    :is-template="true"
    :template-test="templateTestPayload"
  />
  <v-alert v-else type="warning" variant="tonal">
    {{ $t('pages.templates.unsupportedPreviewType') }}
  </v-alert>
</template>

<script setup>
import { computed } from 'vue'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import UserTestEditTestView from '@/ux/UserTest/views/EditTestView.vue'
import HeuristicEditTest from '@/ux/Heuristic/views/EditTest.vue'

const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
})

const normalizedType = computed(() =>
  String(
    props.template?.header?.templateType ||
      props.template?.body?.testType ||
      '',
  ).toUpperCase(),
)

const normalizedSubType = computed(() =>
  String(
    props.template?.header?.templateSubType ||
      props.template?.body?.subType ||
      '',
  ).toUpperCase(),
)

const previewKind = computed(() => {
  if (
    normalizedType.value === STUDY_TYPES.USER &&
    normalizedSubType.value === USER_STUDY_SUBTYPES.MODERATED
  ) {
    return 'moderated'
  }

  if (
    normalizedType.value === STUDY_TYPES.USER &&
    normalizedSubType.value === USER_STUDY_SUBTYPES.UNMODERATED
  ) {
    return 'unmoderated'
  }

  if (normalizedType.value === STUDY_TYPES.HEURISTIC) {
    return 'heuristic'
  }

  return null
})

const templateTestPayload = computed(() => {
  return {
    id: props.template?.id || 'template-preview',
    testTitle:
      props.template?.body?.testTitle ||
      props.template?.header?.templateTitle ||
      'Template Preview',
    testDescription:
      props.template?.body?.testDescription ||
      props.template?.header?.templateDescription ||
      '',
    testType:
      props.template?.header?.templateType || props.template?.body?.testType,
    subType:
      props.template?.header?.templateSubType || props.template?.body?.subType,
    testStructure: structuredClone(props.template?.body?.testStructure || {}),
    testOptions: structuredClone(props.template?.body?.testOptions || []),
    testWeights: structuredClone(props.template?.body?.testWeights || {}),
  }
})
</script>
