<template>
  <v-app>
    <v-container fluid class="pa-0">
      <v-row no-gutters>
        <!-- Left Sidebar Navigation -->
        <v-col cols="2" class="sidebar">
          <v-card flat class="h-100" color="grey-lighten-4">
            <v-card-title class="text-h6 pa-4">WCAG Principles</v-card-title>
            <v-list density="compact" class="pa-2">
              <v-list-group
                v-for="(principle, pIdx) in principles"
                :key="principle.key"
                :value="principle.title.toLowerCase()"
                :prepend-icon="
                  pIdx === 0
                    ? 'mdi-eye'
                    : pIdx === 1
                    ? 'mdi-mouse'
                    : pIdx === 2
                    ? 'mdi-brain'
                    : 'mdi-shield-check'
                "
                :class="{ 'active-principle': selectedPrincipleIdx === pIdx }"
                :active="selectedPrincipleIdx === pIdx"
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :title="principle.title"
                    @click="selectPrinciple(pIdx)"
                  />
                </template>
                <v-list-item
                  v-for="(guideline, gIdx) in principle.Guidelines"
                  :key="guideline.id"
                  prepend-icon="mdi-circle-outline"
                  :title="guideline.id + ' ' + guideline.title"
                  class="ml-4"
                  :active="
                    selectedGuidelineIdx === gIdx &&
                    selectedPrincipleIdx === pIdx
                  "
                  @click="selectGuideline(gIdx)"
                />
              </v-list-group>
            </v-list>
          </v-card>
        </v-col>

        <!-- Main Content Area -->
        <v-col cols="7" class="main-content">
          <v-card flat class="h-100 pa-6 scrollable-content">
            <!-- Breadcrumb -->
            <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4">
              <template #divider>
                <v-icon icon="mdi-chevron-right" />
              </template>
            </v-breadcrumbs>

            <!-- Page Header -->
            <div class="mb-6">
              <h1 class="text-h4 font-weight-bold mb-2">
                {{ currentRule?.id }} {{ currentRule?.title }}
              </h1>
              <div class="d-flex gap-4 mb-4">
                <v-chip color="grey-lighten-2" variant="elevated" size="small">
                  Level {{ currentRule?.level }}
                </v-chip>
                <v-chip color="grey-lighten-2" variant="elevated" size="small">
                  Version {{ currentRule?.version }}
                </v-chip>
              </div>
            </div>

            <!-- Guideline Box -->
            <v-alert variant="outlined" color="info" class="mb-6">
              <template #prepend>
                <v-icon>mdi-information-outline</v-icon>
              </template>
              <div>
                <div class="font-weight-bold mb-2">
                  Guideline: {{ guidelines.value[selectedGuidelineIdx]?.title }}
                </div>
                <div>
                  {{ guidelines.value[selectedGuidelineIdx]?.description }}
                </div>
              </div>
            </v-alert>

            <!-- Success Criterion Section -->
            <div class="mb-6">
              <h2 class="text-h5 font-weight-bold mb-4">Success Criterion</h2>
              <v-expansion-panels variant="accordion" class="mb-2">
                <v-expansion-panel>
                  <v-expansion-panel-title color="success">
                    Show Success Criteria
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list class="pa-0" density="compact">
                      <v-list-item
                        v-for="(crit, cIdx) in currentRule?.criteria || []"
                        :key="cIdx"
                      >
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="selectedCriteria[cIdx]"
                            @change="addToQuill(crit, cIdx)"
                          />
                        </template>
                        <v-list-item-title>
                          <pre class="criterion-pre">{{ crit }}</pre>
                        </v-list-item-title>
                        <v-divider></v-divider>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>

            <!-- Appraiser Notes Section -->
            <div class="my-4">
              <h2 class="text-h5 font-weight-bold mb-4">Appraiser Notes</h2>
              <quill-editor ref="quillEditor" style="height: 60%" />
            </div>
            <!-- Severity section -->
            <div>
              <h2 class="text-h5 font-weight-bold mb-4">Severity</h2>
              <v-radio-group inline>
                <v-radio label="High" value="one" />
                <v-radio label="Medium" value="two" />
                <v-radio label="Low" value="three" />
              </v-radio-group>
            </div>
            <!-- Status Section -->
            <div>
              <h2 class="text-h5 font-weight-bold mb-4">Status</h2>
              <v-radio-group inline>
                <v-radio label="Pass" value="one" />
                <v-radio label="Fail" value="two" />
                <v-radio label="N/A" value="three" />
              </v-radio-group>
            </div>
            <div>
              <v-btn
                prepend-icon="mdi-content-save"
                size="large"
                color="success"
              >
                Save Assessment
              </v-btn>
            </div>
            <v-card flat class="pa-4 mt-4" color="grey-lighten-4">
              <div class="d-flex justify-space-between align-center">
                <v-btn
                  variant="text"
                  prepend-icon="mdi-chevron-left"
                  color="grey-darken-2"
                  @click="prevRule"
                >
                  Previous
                </v-btn>
                <div class="text-body-2 text-grey-darken-1">
                  Rule {{ selectedRuleIdx + 1 }} of {{ rules.value.length }}
                </div>
                <v-btn
                  variant="flat"
                  append-icon="mdi-chevron-right"
                  color="amber"
                  class="text-black"
                  @click="nextRule"
                >
                  Next
                </v-btn>
              </div>
            </v-card>
          </v-card>
        </v-col>

        <!-- Right Sidebar - Table of Contents -->
        <v-col cols="3" class="toc-sidebar">
          <v-card flat class="h-100" color="grey-lighten-5">
            <v-card-title class="text-h6 pa-4">On this page</v-card-title>
            <v-list density="compact" class="pa-2">
              <v-list-item
                v-for="(rule, rIdx) in rules.value"
                :key="rule.id"
                prepend-icon="mdi-circle-outline"
                :title="rule.id + ' ' + rule.title"
                :active="selectedRuleIdx === rIdx"
                class="text-body-2"
                @click="selectRule(rIdx)"
              />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import wacgData from '@/assets/WacgAxe.json'

// Parse and flatten the JSON for easier navigation
const principles = ref([])
const guidelines = ref([])
const rules = ref([])

// State for navigation
const selectedPrincipleIdx = ref(0)
const selectedGuidelineIdx = ref(0)
const selectedRuleIdx = ref(0)
const selectedCriteria = ref({}) // Track selected criteria

// On mount, parse the JSON
function parseWacg() {
  // The JSON is an array of objects, each with a Principle key
  principles.value = wacgData.map((p, i) => {
    const key = Object.keys(p)[0]
    return {
      key,
      ...p[key],
      idx: i,
    }
  })
}
parseWacg()

guidelines.value = computed(() => {
  return principles.value[selectedPrincipleIdx.value]?.Guidelines || []
})

rules.value = computed(() => {
  return guidelines.value.value[selectedGuidelineIdx.value]?.Rules || []
})

const currentRule = computed(() => {
  return rules.value.value[selectedRuleIdx.value] || null
})

// Breadcrumbs
const breadcrumbs = computed(() => {
  const p = principles.value[selectedPrincipleIdx.value]
  const g = guidelines.value.value[selectedGuidelineIdx.value]
  return [
    { title: p?.title || '', disabled: false, href: '#' },
    { title: g?.title || '', disabled: true },
  ]
})

// Sidebar navigation handlers
function selectPrinciple(idx) {
  selectedPrincipleIdx.value = idx
  selectedGuidelineIdx.value = 0
  selectedRuleIdx.value = 0
}
function selectGuideline(idx) {
  selectedGuidelineIdx.value = idx
  selectedRuleIdx.value = 0
}
function selectRule(idx) {
  selectedRuleIdx.value = idx
}

// Next/Previous navigation
function nextRule() {
  if (selectedRuleIdx.value < rules.value.value.length - 1) {
    selectedRuleIdx.value++
  } else if (selectedGuidelineIdx.value < guidelines.value.value.length - 1) {
    selectedGuidelineIdx.value++
    selectedRuleIdx.value = 0
  } else if (selectedPrincipleIdx.value < principles.value.length - 1) {
    selectedPrincipleIdx.value++
    selectedGuidelineIdx.value = 0
    selectedRuleIdx.value = 0
  }
}
function prevRule() {
  if (selectedRuleIdx.value > 0) {
    selectedRuleIdx.value--
  } else if (selectedGuidelineIdx.value > 0) {
    selectedGuidelineIdx.value--
    selectedRuleIdx.value =
      (guidelines.value.value[selectedGuidelineIdx.value]?.Rules?.length || 1) -
      1
  } else if (selectedPrincipleIdx.value > 0) {
    selectedPrincipleIdx.value--
    selectedGuidelineIdx.value =
      (principles.value[selectedPrincipleIdx.value]?.Guidelines?.length || 1) -
      1
    selectedRuleIdx.value =
      (guidelines.value.value[selectedGuidelineIdx.value]?.Rules?.length || 1) -
      1
  }
}

// Add selected criteria to Quill editor
function addToQuill(criterion, index) {
  const quillEditor = document.querySelector('.ql-editor') // Access Quill editor content
  if (selectedCriteria.value[index]) {
    quillEditor.innerHTML += `<p>- ${criterion}</p>` // Append criterion as a new paragraph
  }
}
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #e0e0e0;
  min-height: 100vh;
  overflow: hidden;
  /* Prevent sidebar scroll */
}

.main-content {
  border-right: 1px solid #e0e0e0;
  min-height: 100vh;
  overflow: hidden;
  /* Prevent scroll on main-content wrapper */
}

.toc-sidebar {
  min-height: 100vh;
  overflow: hidden;
  /* Prevent scroll on right sidebar */
}

/* Highlight active principle tab */
.active-principle {
  background-color: #ffd643 !important;
  color: #222 !important;
}

.active-principle .v-list-item__prepend .v-icon {
  color: #222 !important;
}

.h-100 {
  height: 100%;
}

.scrollable-content {
  overflow-y: auto;
  max-height: 100vh;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 10+ */
}

.scrollable-content::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.criterion-pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  background: none;
  border: none;
  padding: 0;
}
</style>
