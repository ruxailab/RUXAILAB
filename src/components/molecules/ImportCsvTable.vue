<template>
  <div style="background-color:#F5F7FF" id="FileUpload">
    <v-col justify="center">
      <v-row class="px-6 pt-2">
        <v-btn class="mb-3" @click="downloadTemplate">
          Donwload CSV template</v-btn
        >
      </v-row>
      <v-divider></v-divider>
      <v-row>
        <v-row class="px-8" justify="center" align="center">
          <v-file-input
            v-model="csvFile"
            class="d-flex justify-center "
            accept=".csv"
            show-size
            truncate-length="15"
            placeholder="Import your CSV testfile here."
            ref="myFile"
          >
          </v-file-input>
          <v-btn
            :loading="loadingUpdate"
            :disabled="loadingUpdate"
            color="blue-grey"
            class="ma-2 white--text"
            @click="changeToJSON"
          >
            Update
            <v-icon right dark>
              mdi-cloud-upload
            </v-icon>
          </v-btn>
        </v-row>
      </v-row>
    </v-col>
  </div>
</template>

<script>
import { getStorage, ref, getDownloadURL } from 'firebase/storage'

export default {
  data() {
    return {
      loading: false,
      loader: null,
      csvFile: null,
      heuristicForm: null,
      refs: this.$refs,
      loadingUpdate: false, // Add the loadingUpdate property
    }
  },

  methods: {
    async changeToJSON() {
      this.loadingUpdate = true
      try {
        let confirmationText =
          'If you accept, all your present heuristics will be replaced by the ones in the .csv file'
        if (confirm(confirmationText)) {
          const reader = new FileReader()
          reader.readAsText(this.csvFile, 'UTF-8') // Use readAsText with UTF-8 encoding
          reader.onload = async () => {
            const csv = reader.result
            const lines = csv.split('\r\n') // Split lines using '\r\n' for cross-platform compatibility
            const headers = lines[0].split(';').map((header) => header.trim()) // Trim headers

            const heuristicMap = new Map()

            for (let i = 1; i < lines.length; i++) {
              const currentline = lines[i]
              if (!currentline) continue

              const currentFields = currentline.split(';')
              const heuristicId = currentFields[0]
              const heuristicTitle = currentFields[1]
              const questionId = currentFields[2]
              const questionText = currentFields[3]

              if (!heuristicMap.has(heuristicId)) {
                heuristicMap.set(heuristicId, {
                  id: heuristicId,
                  title: heuristicTitle,
                  questions: [],
                })
              }

              const heuristicEntry = heuristicMap.get(heuristicId)
              heuristicEntry.questions.push({
                id: questionId,
                title: questionText,
                descriptions: questionText,
                text: questionText,
              })
            }

            const heuristicTest = Array.from(heuristicMap.values())
            this.$store.state.Tests.Test.testStructure = heuristicTest
            this.$store.dispatch('updateTest', this.test)
          }
        }
      } catch (error) {
        // Handle errors here if necessary
        console.error('Update action failed:', error)
      } finally {
        this.loadingUpdate = false
      }
    },

    async downloadTemplate() {
      const storage = getStorage()
      const starsRef = ref(storage, 'template-csv/heuristic-template.csv')
      getDownloadURL(starsRef)
        .then((url) => {
          window.open(url, '_blank')
        })
        .catch((error) => {
          switch (error.code) {
            case 'storage/object-not-found':
              // File doesn't exist
              break
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break
            case 'storage/canceled':
              // User canceled the upload
              break
            case 'storage/unknown':
              // Unknown error occurred, inspect the server response
              break
          }
        })
    },
  },
  watch: {
    loader() {
      const l = this.loader
      this[l] = !this[l]
      // const alertFunc = alert("Your file has been uploaded!");
      if (this.csvFile != null) {
        setTimeout(() => (this[l] = false), 3000)
        setTimeout(() => (this.csvFile = null), 3000)
        // setTimeout(alertFunc, 3000);
        this.loader = null
      } else {
        setTimeout(() => (this[l] = false), 3000)
        alert('No csv file selected. \nPlease select one before procede.')
        this.loader = null
      }
    },
  },
  computed: {
    test() {
      return this.$store.getters.test
    },
    user() {
      return this.$store.getters.user
    },
    csvHeuristics() {
      return this.$store.state.Tests.currentTest
    },
  },
}
</script>

<style>
.csv-box {
  background-color: white;
}
</style>
