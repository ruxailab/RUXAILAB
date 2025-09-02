<template>
  <AccessibilityTestSettings
    title="Accessibility Test Configuration"
    subtitle="Manage your accessibility test settings and configuration with advanced controls"
    test-icon="mdi-eye-check-outline"
    icon-color="primary"
    advanced-description="Test configuration and compliance options"
    :composable-config="config"
  >
    <template #advanced-settings="{ object, updateObject }">
      <!-- Compliance Level -->
      <v-select
        v-model="object.configData.complianceLevel"
        :items="complianceLevels"
        label="WCAG Compliance Level"
        variant="outlined"
        density="comfortable"
        @update:model-value="updateObject(object)"
      />
    </template>
  </AccessibilityTestSettings>
</template>

<script setup>
import AccessibilityTestSettings from '@/shared/components/AccessibilityTestSettings.vue';
import ManualAccessibilityTest from '@/ux/accessibility/models/ManualAccessibilityTest';

const complianceLevels = [
  { title: 'Level A', value: 'A' },
  { title: 'Level AA', value: 'AA' },
  { title: 'Level AAA', value: 'AAA' },
];

// Configure the composable for manual accessibility tests
const config = {
  storeModule: 'manualAccessibility',
  testListRoute: 'ManualAccessibilityTests',
  testType: 'MANUAL_ACCESSIBILITY',
  defaultObject: {
    id: null,
    title: '',
    testTitle: '',
    description: '',
    testDescription: '',
    websiteUrl: '',
    testType: 'MANUAL_ACCESSIBILITY',
    status: 'draft',
    isPublic: false,
    configData: {
      complianceLevel: 'AA',
      includeNonInterference: true,
    },
    testAdmin: null,
    createdAt: null,
    updatedAt: null
  },
  createTestInstance: (data) => new ManualAccessibilityTest(data)
};
</script>


