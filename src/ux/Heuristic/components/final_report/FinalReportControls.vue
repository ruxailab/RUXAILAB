<template>
  <div class="controls">
    <button
      class="control-buttons"
      @click="makeBold"
    >
      <span class="mdi mdi-format-bold md-14" />
    </button>
    <button
      class="control-buttons"
      @click="makeItalic"
    >
      <span class="mdi mdi-format-italic" />
    </button>
    <button
      class="control-buttons"
      @click="makeHighlight"
    >
      <span class="mdi mdi-format-underline" />
    </button>
    <!-- <button class="control-buttons" @click="outDent">
      <span class="mdi mdi-format-list-bulleted"></span>
    </button> -->
    <button
      class="control-buttons"
      @click="copyAll"
    >
      <span class="mdi mdi-content-copy" />
    </button>
    <button
      class="control-buttons"
      @click="left"
    >
      <span class="mdi mdi-format-align-left" />
    </button>
    <button
      class="control-buttons"
      @click="center"
    >
      <span class="mdi mdi-format-align-center" />
    </button>
    <button
      class="control-buttons"
      @click="right"
    >
      <span class="mdi mdi-format-align-right" />
    </button>
    <button
      class="control-buttons"
      @click="justify"
    >
      <span class="mdi mdi-format-align-justify" />
    </button>
    <button
      class="control-buttons"
      @click="remove"
    >
      <span class="mdi mdi-playlist-remove" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showError, showInfo } from '@/shared/utils/toast'

// Initialize i18n
const { t } = useI18n()

// Initialize toast
// Reactive state
const title = ref('Enter your text here:')
const inputText = ref('')

// Methods
const makeBold = () => {
  document.execCommand('bold', false, null)
}

const makeItalic = () => {
  document.execCommand('italic', false, null)
}

const makeHighlight = () => {
  document.execCommand('underline', false, null)
}

const copyAll = () => {
  // Fix Firefox losing focus when button is clicked
  document.getElementById('myTextarea').focus()
  // Catch any unforeseen errors
  try {
    document.execCommand('selectAll', false, null)
    const success = document.execCommand('copy')
    // Output whether or not copy was successful
    success ? showInfo('alerts.copy') : showError('alerts.noCopy')
  } catch (e) {
    showError('alerts.errorOccurred')
  }
}

const center = () => {
  document.execCommand('justifyCenter', false, null)
}

const justify = () => {
  document.execCommand('justifyFull', false, null)
}

const left = () => {
  document.execCommand('justifyLeft', false, null)
}

const right = () => {
  document.execCommand('justifyRight', false, null)
}

const remove = () => {
  document.execCommand('removeFormat', false, null)
}
</script>

<style>
.controls {
  margin-left: 10px;
  width: fit-content;
}

.control-buttons {
  margin-right: 1rem;
  font-size: 28px;
}
</style>