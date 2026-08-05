<template>
  <PageWrapper :title="$t('focusGroup.edit.title')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('focusGroup.edit.subtitle') }}
      </p>
    </template>

    <v-container class="pa-0">
      <ButtonSave :visible="true" @click="save" />

      <div>
        <v-tabs bg-color="transparent" color="#FCA326" class="pb-0 mb-0">
          <v-tab @click="index = 0">
            {{ $t('focusGroup.edit.tabs.configuration') }}
          </v-tab>
          <v-tab @click="index = 1">
            {{ $t('focusGroup.edit.tabs.consent') }}
          </v-tab>
          <v-tab @click="index = 2">
            {{ $t('focusGroup.edit.tabs.guide') }}
          </v-tab>
        </v-tabs>

        <v-col cols="12">
          <!-- SESSION CONFIGURATION -->
          <div v-if="index === 0">
            <SessionConfigEditor v-model="config" />
          </div>

          <!-- CONSENT FORM -->
          <div v-if="index === 1">
            <v-alert
              v-if="config.requireConsent && !hasConsentText"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mb-3"
              :text="$t('focusGroup.config.consentMissing')"
            />
            <v-alert
              v-if="!config.requireConsent"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-3"
              :text="$t('focusGroup.config.consentDisabled')"
            />
            <TextareaForm
              v-model="config.consentText"
              :title="$t('focusGroup.config.consentTitle')"
              :subtitle="$t('focusGroup.config.consentSubtitle')"
            />
          </div>

          <!-- DISCUSSION GUIDE -->
          <div v-if="index === 2">
            <v-card elevation="2" rounded="lg" class="pa-6">
              <DiscussionGuideEditor v-model="topics" />
            </v-card>
          </div>
        </v-col>
      </div>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import DiscussionGuideEditor from '@/ux/FocusGroup/components/DiscussionGuideEditor.vue'
import SessionConfigEditor from '@/ux/FocusGroup/components/SessionConfigEditor.vue'
import DiscussionTopic from '@/ux/FocusGroup/models/DiscussionTopic'
import FocusGroupConfig from '@/ux/FocusGroup/models/FocusGroupConfig'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'
import ButtonSave from '@/shared/components/buttons/ButtonSave.vue'
import TextareaForm from '@/shared/components/TextareaForm.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()

const index = ref(0)
const topics = ref([])
const config = ref(new FocusGroupConfig())
const test = computed(() => store.getters.test)

// Quill stores empty content as markup such as "<p><br></p>", so strip tags
// before treating the form as authored.
const hasConsentText = computed(
  () =>
    (config.value.consentText ?? '').replace(/<[^>]*>/g, '').trim().length > 0,
)

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
