<template>
  <div>
    <v-row justify="center">
      <v-col class="ma-10" cols="10">
        <v-row class="ma-2" justify="center" align="center">
          <v-file-input
            v-model="csvFile"
            class="d-flex justify-center "
            accept=".csv"
            show-size
            truncate-length="15"
            placeholder="Import your CSV file here."
          >
          </v-file-input>
          <v-btn
            :loading="loading"
            :disabled="loading"
            color="blue-grey"
            class="ma-2 white--text"
            @click="csvImportBtn(), (loader = 'loading')"
          >
            Upload
            <v-icon right dark>
              mdi-cloud-upload
            </v-icon>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {},
  components: {},
  data: () => ({
    loading: false,
    loader: null,
    csvFile: null,
  }),
  methods: {
    csvImportBtn() {
      console.log(this.csvFile);
    },
  },
  watch: {
    loader() {
      const l = this.loader;
      this[l] = !this[l];
      // const alertFunc = alert("Your file has been uploaded!");

      if (this.csvFile != null) {
        setTimeout(() => (this[l] = false), 3000);
        setTimeout(() => (this.csvFile = null), 3000);
        // setTimeout(alertFunc, 3000);
        this.loader = null;
      } else {
        setTimeout(() => (this[l] = false), 3000);
        alert("No csv file selected. \nPlease select one before procede.");
        this.loader = null;
      }
    },
  },
};
</script>
