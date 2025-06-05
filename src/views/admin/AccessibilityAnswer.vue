<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Accessibility Assessment Results</span>
            <v-btn color="primary" prepend-icon="mdi-download" @click="downloadAssessmentData" :loading="isLoading">
              Export JSON
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table :headers="headers" :items="Object.values(assessmentData)" :items-per-page="10"
              :loading="isLoading" class="elevation-1" height="75vh">
              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" class="text-uppercase" size="small">
                  {{ item.status || 'Not Set' }}
                </v-chip>
              </template>

              <template v-slot:item.severity="{ item }">
                <v-chip :color="getSeverityColor(item.severity)" class="text-uppercase" size="small" variant="outlined">
                  {{ item.severity || 'Not Set' }}
                </v-chip>
              </template>

              <template v-slot:item.notes="{ item }">
                <v-btn v-if="item.notes && item.notes.length > 0" icon size="small" @click="openNotesDialog(item)">
                  <v-icon size="small">mdi-note-text-outline</v-icon>
                </v-btn>
                <span v-else class="text-grey">-</span>
              </template>

            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Notes Dialog -->
  <v-dialog v-model="notesDialog.show" max-width="800px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Notes for {{ notesDialog.ruleId }} - {{ notesDialog.ruleTitle }}</span>
        <v-btn icon @click="notesDialog.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-list>
          <v-list-item v-for="(note, index) in notesDialog.notes" :key="index" class="mb-4">
            <template v-slot:prepend>
              <v-avatar color="primary" size="40" class="mr-4">
                <span class="text-white">{{ index + 1 }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-h6 mb-2">
              Note {{ index + 1 }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-1 mb-2">
              {{ note.text }}
            </v-list-item-subtitle>
            <v-img v-if="note.imagePreview" :src="note.imagePreview" max-height="300" contain
              class="mt-2 mb-2 rounded"></v-img>
            <v-chip v-if="note.imageName" size="small" color="grey lighten-2" class="mt-2">
              <v-icon size="small" class="mr-1">mdi-image</v-icon>
              {{ note.imageName }}
            </v-chip>
          </v-list-item>
          <v-list-item v-if="!notesDialog.notes || notesDialog.notes.length === 0">
            <v-list-item-title class="text-grey">
              No notes available for this rule.
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="notesDialog.show = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const store = useStore()
const toast = useToast()
const isLoading = ref(true)
const assessmentData = ref({})

// Notes dialog state
const notesDialog = ref({
  show: false,
  ruleId: '',
  ruleTitle: '',
  notes: []
})

const headers = [
  { title: 'Rule ID', key: 'ruleId', sortable: true },
  { title: 'Title', key: 'ruleTitle', sortable: true },
  { title: 'Principle', key: 'principle', sortable: true },
  { title: 'Guideline', key: 'guideline', sortable: true },
  { title: 'Level', key: 'level', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Severity', key: 'severity', sortable: true },
  { title: 'Notes', key: 'notes', sortable: false, align: 'center' },
]

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pass': return 'success'
    case 'fail': return 'error'
    case 'na': return 'grey'
    default: return 'grey lighten-2'
  }
}

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'grey lighten-2'
  }
}

const openNotesDialog = (item) => {
  notesDialog.value = {
    show: true,
    ruleId: item.ruleId,
    ruleTitle: item.ruleTitle,
    notes: item.notes || []
  }
}

const loadAssessmentData = async () => {
  try {
    isLoading.value = true
    // Ensure WCAG data is loaded
    if (!store.state.Assessment.wcagData) {
      await store.dispatch('Assessment/initializeAssessment')
    }
    // Get all assessments
    assessmentData.value = store.getters['Assessment/getAllAssessments']
  } catch (error) {
    console.error('Error loading assessment data:', error)
    toast.error('Failed to load assessment data')
  } finally {
    isLoading.value = false
  }
}

const downloadAssessmentData = () => {
  try {
    const dataStr = JSON.stringify(assessmentData.value, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `accessibility-assessment-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast.success('Assessment data exported successfully')
  } catch (error) {
    console.error('Error exporting assessment data:', error)
    toast.error('Failed to export assessment data')
  }
}

onMounted(() => {
  loadAssessmentData()
})
</script>

<style scoped>
.v-data-table {
  --v-theme-surface: #ffffff;
}

.v-data-table-header {
  background-color: #f5f5f5;
}

.v-data-table-header th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.v-data-table__td {
  padding: 12px 16px;
}

.v-chip {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Custom scrollbar for notes dialog */
.v-dialog .v-card {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.v-dialog .v-card__text {
  overflow-y: auto;
  flex: 1;
}

/* Style for note items */
.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  align-items: flex-start;
}

.v-list-item:last-child {
  border-bottom: none;
}

/* Avatar styling */
.v-avatar {
  flex-shrink: 0;
}
</style>
