<template>
  <ManagerView :navigator="navigator" :top-cards="[]" :bottom-cards="[]">
    <template v-if="$route.path.includes('manager')" #default>
      <ManagerBanner :title="test?.testTitle" />

      <v-container class="card-container">
        <v-card class="pa-6" elevation="2" rounded="lg">
          <div class="d-flex align-center mb-4">
            <v-icon
              icon="mdi-account-group"
              color="primary"
              size="32"
              class="me-3"
            />
            <h2 class="text-h5 font-weight-bold">
              {{ $t('focusGroup.manager.title') }}
            </h2>
          </div>

          <v-alert
            type="info"
            variant="tonal"
            border="start"
            class="mb-2"
          >
            {{ $t('focusGroup.manager.underConstruction') }}
          </v-alert>

          <p class="text-body-2 text-grey-darken-1 mt-4 mb-0">
            {{ $t('focusGroup.manager.description') }}
          </p>
        </v-card>
      </v-container>
    </template>
  </ManagerView>
</template>

<script setup>
import ManagerView from '@/shared/views/template/ManagerView.vue'
import ManagerBanner from '@/shared/components/ManagerBanner.vue'
import { ICONS } from '@/shared/constants/theme'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()

const test = computed(() => store.getters.test)

// Trimmed navigator — only routes that exist in the skeleton module.
// Edit / Reports / Answers links are added as those views are built.
const navigator = computed(() => {
  if (!test.value) return []
  return [
    {
      title: 'Manager',
      icon: ICONS.MANAGER,
      path: `/focusGroup/manager/${route.params.id}`,
    },
    {
      title: 'Test',
      icon: ICONS.DOCUMENT_EDIT,
      path: `/focusGroup/edit/${test.value.id}`,
    },
    {
      title: 'Cooperators',
      icon: ICONS.ACCOUNT_GROUP,
      path: `/focusGroup/cooperators/${test.value.id}`,
    },
    {
      title: 'Settings',
      icon: ICONS.COG,
      path: `/focusGroup/settings/${test.value.id}`,
    },
  ]
})

onMounted(async () => {
  await store.dispatch('getStudy', { id: route.params.id })
})
</script>
