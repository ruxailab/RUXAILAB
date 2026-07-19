<template>
  <v-container class="py-6" style="max-width: 900px">
    <div class="d-flex align-center mb-2">
      <v-icon icon="mdi-forum-outline" color="primary" size="28" class="me-3" />
      <h2 class="text-h5 font-weight-bold">
        {{ $t('focusGroup.edit.title') }}
      </h2>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      {{ $t('focusGroup.edit.subtitle') }}
    </p>

    <v-card elevation="2" rounded="lg" class="pa-6">
      <DiscussionGuideEditor v-model="topics" />
    </v-card>

    <v-card elevation="2" rounded="lg" class="pa-6 mt-6">
      <SessionConfigEditor v-model="config" />
    </v-card>

    <div class="d-flex justify-end mt-6">
      <v-btn
        color="primary"
        variant="elevated"
        :loading="loading"
        prepend-icon="mdi-content-save"
        class="text-none"
        @click="save"
      >
        {{ $t('focusGroup.edit.save') }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import DiscussionGuideEditor from '@/ux/FocusGroup/components/DiscussionGuideEditor.vue'
import SessionConfigEditor from '@/ux/FocusGroup/components/SessionConfigEditor.vue'
import DiscussionTopic from '@/ux/FocusGroup/models/DiscussionTopic'
import FocusGroupConfig from '@/ux/FocusGroup/models/FocusGroupConfig'
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()

const topics = ref([])
const config = ref(new FocusGroupConfig())
const test = computed(() => store.getters.test)
const loading = computed(() => store.state.loading)

const hydrate = (study) => {
  if (!study) return
  topics.value = (study.discussionGuide ?? []).map((t) => new DiscussionTopic(t))
  config.value = new FocusGroupConfig(study.config ?? {})
}

watch(test, hydrate)

const save = async () => {
  await store.dispatch('saveFocusGroupSettings', {
    studyId: route.params.id,
    discussionGuide: topics.value,
    config: config.value,
  })
}

onMounted(async () => {
  if (!test.value) await store.dispatch('getStudy', { id: route.params.id })
  hydrate(test.value)
})
</script>
