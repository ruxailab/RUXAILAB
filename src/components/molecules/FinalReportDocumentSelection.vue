<template>
  <SelectionBox></SelectionBox>
</template>

<script>
import SelectionBox from '@/components/atoms/FinalReportSelectionBox.vue'
export default {
  props: ['id', 'HEURISTICS'],

  components: { SelectionBox },
}
</script>
