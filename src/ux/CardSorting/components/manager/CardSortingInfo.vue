<template>
  <v-card class="h-100" elevation="2">
    <div class="info-header pa-4">
      <div class="d-flex align-center">
        <div class="icon-container mr-3">
          <v-icon color="white" size="24">mdi-cards</v-icon>
        </div>
        <div>
          <h3 class="text-h6 text-white mb-0">
            {{ $t('CardSorting.studyStructure') }}
          </h3>
          <p class="text-body-2 text-white opacity-90 mb-0">
            {{ $t('CardSorting.studyStructureSubtitle') }}
          </p>
        </div>
      </div>
    </div>

    <v-card-text class="pa-4">
      <div class="mb-3 d-flex justify-space-between align-center">
        <span class="text-body-2">{{ $t('CardSorting.cards') }}</span>
        <v-chip size="small" color="primary" variant="outlined">
          {{ cardsCount }}
        </v-chip>
      </div>
      <div class="mb-3 d-flex justify-space-between align-center">
        <span class="text-body-2">{{ $t('CardSorting.categories') }}</span>
        <v-chip size="small" color="info" variant="outlined">
          {{ categoriesCount }}
        </v-chip>
      </div>
      <div class="d-flex justify-space-between align-center">
        <span class="text-body-2">{{ $t('CardSorting.submitted') }}</span>
        <v-chip size="small" color="success" variant="outlined">
          {{ submittedCount }}
        </v-chip>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" size="small" color="primary" @click="goToResults">
        {{ $t('CardSorting.viewResults') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const store = useStore()

const answers = computed(() => store.getters.cardSortingAnswersList)

const cardsCount = computed(
  () => props.test?.testStructure?.cardSorting?.cards?.length || 0,
)
const categoriesCount = computed(
  () => props.test?.testStructure?.cardSorting?.categories?.length || 0,
)
const submittedCount = computed(
  () => answers.value.filter((answer) => answer?.submitted).length,
)

const goToResults = () => {
  router.push(`/cardSorting/answer/${props.test.id}`)
}
</script>

<style scoped>
.info-header {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  backdrop-filter: blur(10px);
}
</style>
