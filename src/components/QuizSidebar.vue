<template>
  <v-card
    class="sidebar-card h-100"
    color="#f5f7ff"
    elevation="2"
  >
    <v-list nav>
      <v-list-subheader class="text-h6">
        WCAG Principles
      </v-list-subheader>
      <v-list-item
        v-for="(principle, index) in principles"
        :key="index"
        :value="principle"
        density="compact"
        color="primary"
        class="mt-8"
        @click="$emit('select-principle', principle)"
      >
        <template #prepend>
          <v-icon>{{ getPrincipleIcon(principle.title) }}</v-icon>
        </template>
        <v-list-item-title>{{ principle.title }}</v-list-item-title>
        <v-list-item-subtitle class="text-wrap">
          {{ principle.description }}
        </v-list-item-subtitle>
      </v-list-item>
      <v-list-item
        density="compact"
        :value="null"
        color="primary"
        class="mt-8"
        @click="$emit('select-all')"
      >
        <template #prepend>
          <v-icon>mdi-check-all</v-icon>
        </template>
        <v-list-item-title>All Principles</v-list-item-title>
        <v-list-item-subtitle class="text-wrap">
          Test all WCAG principles
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
const props = defineProps({
  principles: {
    type: Array,
    required: true,
  },
  selectedPrinciple: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['select-principle', 'select-all'])
function getPrincipleIcon(title) {
  const icons = {
    Perceivable: 'mdi-eye',
    Operable: 'mdi-cursor-default-click',
    Understandable: 'mdi-book-open-page-variant',
    Robust: 'mdi-shield-check',
  }
  return icons[title] || 'mdi-checkbox-marked-circle'
}
</script>
