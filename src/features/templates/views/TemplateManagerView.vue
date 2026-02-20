<template>
  <v-container class="pa-0 ma-0" fluid>
    <Snackbar />
    <Loading />

    <v-row v-if="template" class="nav pa-0 ma-0" dense>
      <Drawer :items="navigator" />

      <v-col class="background pa-0 ma-0">
        <ManagerBanner
          v-if="currentSection === 'manager'"
          :title="template.header?.templateTitle || 'Template'"
        />

        <v-container
          :class="
            currentSection === 'manager'
              ? 'content-container'
              : 'content-container content-container--wide py-6'
          "
        >
          <TemplateDashboard
            v-if="currentSection === 'manager'"
            :template="template"
          />

          <TemplateReadOnlyPreview
            v-else-if="currentSection === 'preview'"
            :template="template"
          />

          <TemplateConfigPanel
            v-else-if="currentSection === 'config' && isOwner"
            :template="template"
          />

          <v-alert
            v-else
            type="warning"
            variant="tonal"
            text="You do not have permission to access this section."
          />
        </v-container>
      </v-col>
    </v-row>

    <v-container v-else class="py-10">
      <v-alert
        type="error"
        variant="tonal"
        text="Template not found or inaccessible."
      />
    </v-container>
  </v-container>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Snackbar from '@/shared/components/Snackbar.vue'
import Loading from '@/shared/components/Loading.vue'
import Drawer from '@/shared/components/Drawer.vue'
import ManagerBanner from '@/shared/components/ManagerBanner.vue'
import TemplateDashboard from '@/features/templates/components/TemplateDashboard.vue'
import TemplateReadOnlyPreview from '@/features/templates/components/TemplateReadOnlyPreview.vue'
import TemplateConfigPanel from '@/features/templates/components/TemplateConfigPanel.vue'

const store = useStore()
const route = useRoute()

const template = computed(() => store.state.Templates.currentTemplate)
const user = computed(() => store.state.Auth.user)

const isOwner = computed(() => {
  const ownerId = template.value?.header?.templateAuthor?.userDocId
  return Boolean(ownerId && user.value?.id && ownerId === user.value.id)
})

const currentSection = computed(() => route.meta?.templateSection || 'manager')

const basePath = computed(() => {
  const testType = route.params.TestType
  const studyType = route.params.StudyType
  return `/${testType}/${studyType}/template`
})

const navigator = computed(() => {
  if (!route.params?.id) return []

  const items = [
    {
      title: 'Manager',
      icon: 'mdi-view-dashboard',
      path: `${basePath.value}/manager/${route.params.id}`,
    },
    {
      title: 'Preview',
      icon: 'mdi-eye-outline',
      path: `${basePath.value}/preview/${route.params.id}`,
    },
  ]

  if (isOwner.value) {
    items.push({
      title: 'Settings',
      icon: 'mdi-cog',
      path: `${basePath.value}/config/${route.params.id}`,
    })
  }

  return items
})

const loadTemplate = async () => {
  if (!route.params?.id) return
  await store.dispatch('getTemplateById', route.params.id)
}

onMounted(async () => {
  await loadTemplate()
})

watch(
  () => route.params.id,
  async () => {
    await loadTemplate()
  },
)
</script>

<style scoped>
.background {
  background-color: #e8eaf2;
  min-height: 100vh;
  overflow: auto;
}

.background::-webkit-scrollbar {
  display: none;
}

.content-container {
  width: 92%;
  max-width: 1200px;
}

.content-container--wide {
  width: 100%;
  max-width: none;
}
</style>
