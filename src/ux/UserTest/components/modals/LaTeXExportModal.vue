<template>
  <v-dialog v-model="isOpen" max-width="800px">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        LaTeX Code Export
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <div class="text-subtitle-2 font-weight-bold mb-2">
            Required Packages (add to preamble):
          </div>
          <div class="code-display">
            <pre><code>{{ latexCode.packages }}</code></pre>
          </div>
        </div>

        <div>
          <div class="text-subtitle-2 font-weight-bold mb-2">
            Graphic Code (add to document body):
          </div>
          <div class="code-display">
            <pre><code>{{ latexCode.content }}</code></pre>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-space-between">
        <v-btn @click="closeDialog">Close</v-btn>
        <div class="d-flex align-center gap-2">
          <v-btn color="primary" @click="copyToClipboard">
            Copy All Code
          </v-btn>
          <v-slide-x-transition>
            <span v-if="copySuccess" class="text-success font-weight-bold">
              ✓ Copied successfully!
            </span>
          </v-slide-x-transition>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { generatePieChartLatex } from '../../utils/latexPieChartGenerator.js'

const props = defineProps({
  modelValue: Boolean,
  questionTitle: String,
  options: Array,
  counts: Object,
  colors: Array,
})

const emit = defineEmits(['update:modelValue'])

const copySuccess = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const latexCode = computed(() =>
  generatePieChartLatex(props.questionTitle, props.options, props.counts, props.colors)
)

const copyToClipboard = async () => {
  try {
    const fullCode = `${latexCode.value.packages}\n\n${latexCode.value.content}`
    await navigator.clipboard.writeText(fullCode)
    copySuccess.value = true
    // Hide message after 3 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const closeDialog = () => {
  isOpen.value = false
}
</script>

<style scoped>
.code-display {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.code-display pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.code-display code {
  color: #333;
}

.gap-2 {
  gap: 8px;
}

.text-success {
  color: #4caf50;
}
</style>
