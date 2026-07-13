<template>
  <PageWrapper :title="$t('CardSorting.answers')" :side-gap="true">
    <template #subtitle>
      <p class="text-body-1 text-grey-darken-1">
        {{ $t('CardSorting.answersSubtitle') }}
      </p>
    </template>

    <v-container>
      <div
        v-if="answers.length === 0"
        class="text-center text-medium-emphasis py-10"
      >
        <v-icon size="48" color="grey-lighten-1">mdi-inbox-outline</v-icon>
        <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
      </div>

      <v-expansion-panels v-else variant="accordion">
        <v-expansion-panel
          v-for="(answer, index) in answers"
          :key="answer.userDocId || index"
        >
          <v-expansion-panel-title>
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="36" class="mr-3">
                  <span class="text-white">{{
                    getInitials(answer.fullName)
                  }}</span>
                </v-avatar>
                <span class="font-weight-medium">
                  {{ answer.fullName || $t('CardSorting.anonymous') }}
                </span>
              </div>
              <v-chip
                size="small"
                :color="answer.submitted ? 'success' : 'warning'"
                variant="tonal"
                class="mr-4"
              >
                {{ answer.submitted
                  ? $t('CardSorting.submitted')
                  : $t('CardSorting.inProgress') }}
              </v-chip>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-row>
              <v-col
                v-for="category in categoryTitles"
                :key="category"
                cols="12"
                md="4"
              >
                <v-card variant="outlined" rounded="lg" class="pa-3 h-100">
                  <h4 class="mb-2">{{ category }}</h4>
                  <v-chip
                    v-for="cardTitle in answer.sorting?.[category] || []"
                    :key="cardTitle"
                    size="small"
                    class="ma-1"
                    color="primary"
                    variant="tonal"
                  >
                    {{ cardTitle }}
                  </v-chip>
                  <p
                    v-if="!(answer.sorting?.[category] || []).length"
                    class="text-caption text-medium-emphasis mb-0"
                  >
                    {{ $t('CardSorting.emptyCategory') }}
                  </p>
                </v-card>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>
  </PageWrapper>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import PageWrapper from '@/shared/views/template/PageWrapper.vue'

const store = useStore()
const route = useRoute()

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const categoryTitles = computed(
  () =>
    (test.value?.testStructure?.cardSorting?.categories || []).map(
      (c) => c.title,
    ),
)

const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?'

onMounted(async () => {
  if (!test.value) {
    await store.dispatch('getStudy', { id: route.params.id })
  }
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>
