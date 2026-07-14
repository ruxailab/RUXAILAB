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
import DiscussionTopic from '@/ux/FocusGroup/models/DiscussionTopic'
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()

const topics = ref([])
const test = computed(() => store.getters.test)
const loading = computed(() => store.state.loading)

const hydrate = (study) => {
  if (!study) return
  topics.value = (study.discussionGuide ?? []).map((t) => new DiscussionTopic(t))
}

watch(test, hydrate)

const save = async () => {
  await store.dispatch('saveDiscussionGuide', {
    studyId: route.params.id,
    discussionGuide: topics.value,
  })
}

onMounted(async () => {
  if (!test.value) await store.dispatch('getStudy', { id: route.params.id })
  hydrate(test.value)
})
</script>
