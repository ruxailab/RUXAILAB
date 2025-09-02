<template>
  <AccessibilityTestSettings
    title="Automatic Accessibility Test Configuration"
    subtitle="Manage your automatic accessibility test settings and configuration with advanced controls"
    test-icon="mdi-robot-outline"
    icon-color="primary"
    advanced-description="Test configuration and automation options"
    :composable-config="config"
  >
    <template #advanced-settings="{ object, updateObject }">
      <!-- Test Version -->
      <v-text-field
        v-model="object.version"
        label="Test Version"
        variant="outlined"
        density="comfortable"
        placeholder="2.1"
        @update:model-value="updateObject(object)"
      />
    </template>
  </AccessibilityTestSettings>
</template>

<script setup>
import AccessibilityTestSettings from '@/shared/components/AccessibilityTestSettings.vue';
import AutomaticAccessibilityTest from '@/ux/accessibility/models/AutomaticAccessibilityTest';

// Configure the composable for automatic accessibility tests
const config = {
  storeModule: 'automaticAccessibility',
  testListRoute: 'AutomaticAccessibilityTests',
  testType: 'AUTOMATIC_ACCESSIBILITY',
  defaultObject: {
    title: '',
    testTitle: '',
    description: '',
    testDescription: '',
    websiteUrl: '',
    status: 'draft',
    version: '2.1',
    isPublic: false,
    testType: 'AUTOMATIC_ACCESSIBILITY',
  },
  createTestInstance: (data) => new AutomaticAccessibilityTest(data)
};
</script>

