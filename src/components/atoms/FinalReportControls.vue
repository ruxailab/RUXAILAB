<template>
  <div class="controls">
    <button class="control-buttons" @click="makeBold()">
      <span class="mdi mdi-format-bold md-14"></span>
    </button>
    <button class="control-buttons" @click="makeItalic()">
      <span class="mdi mdi-format-italic"></span>
    </button>
    <button class="control-buttons" @click="makeHighlight()">
      <span class="mdi mdi-format-underline"></span>
    </button>
    <!-- <button class="control-buttons" @click="outDent()">
      <span class="mdi mdi-format-list-bulleted"></span>
    </button> -->
    <button class="control-buttons" @click="copyAll()">
      <span class="mdi mdi-content-copy"></span>
    </button>
    <button class="control-buttons" @click="left()">
      <span class="mdi mdi-format-align-left"></span>
    </button>
    <button class="control-buttons" @click="center()">
      <span class="mdi mdi-format-align-center"></span>
    </button>
    <button class="control-buttons" @click="right()">
      <span class="mdi mdi-format-align-right"></span>
    </button>
    <button class="control-buttons" @click="justify()">
      <span class="mdi mdi-format-align-justify"></span>
    </button>
    <button class="control-buttons" @click="remove()">
      <span class="mdi mdi-playlist-remove"></span>
    </button>
  </div>
</template>

<script>
export default {
  props: ['id', 'HEURISTICS'],
  data: () => ({ title: 'Enter your text here:', inputText: '' }),
  computed: {},
  watch: {},

  methods: {
    makeBold() {
      document.execCommand('bold', false, null)
    },
    makeItalic() {
      document.execCommand('italic', false, null)
    },
    makeHighlight() {
      document.execCommand('underline', false, null)
    },
    copyAll() {
      // fix Firefox losing focus when button is clicked
      document.getElementById('myTextarea').focus()
      // catch any unforeseen errors
      try {
        document.execCommand('selectAll', false, null)
        let success = document.execCommand('copy')
        // output whether or not copy was successful
        success ? alert('copy successful') : alert('copy unsuccessful')
      } catch (e) {
        alert('An error has occurred')
      }
    },
    center() {
      document.execCommand('justifyCenter', false, null)
    },
    justify() {
      document.execCommand('justifyFull', false, null)
    },
    left() {
      document.execCommand('justifyLeft', false, null)
    },
    right() {
      document.execCommand('justifyRight', false, null)
    },
    remove() {
      document.execCommand('removeFormat', false, null)
    },
    // outDent() {
    //   document.execCommand('insertUnorderedList', false, null)
    // },
  },
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
