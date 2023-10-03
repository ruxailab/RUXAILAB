<template>
  <SelectionBox />
</template>

<script>
import SelectionBox from '@/components/atoms/FinalReportSelectionBox.vue'
export default {

  components: { SelectionBox },
  props: ['id', 'HEURISTICS'],
}
</script>
