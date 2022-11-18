<template>
  <div id="FileUpload">
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
            ref="myFile"
          >
          </v-file-input>
          <v-btn
            :loading="loading"
            :disabled="loading"
            color="blue-grey"
            class="ma-2 white--text"
            @click="(loader = 'loading'), changeToJSON()"
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
  props: {
    heuristics: {
      type: Array,
      required: true,
      default: function() {
        return [];
      },
    },
  },
  data() {
    return {
      loading: false,
      loader: null,
      csvFile: null,
      refs: this.$refs,
    };
  },

  methods: {
    changeToJSON() {
      console.log("the inputed file is: ");
      console.log(this.csvFile);
      let lines = "";
      let currentline = "";
      let csv = "";
      let headers = "";
      let result = [];
      let result2 = [];
      let reader = new FileReader();

      reader.readAsBinaryString(this.csvFile);

      reader.onload = (csvFile) => {
        console.log(csvFile);
        csv = reader.result;
        lines = csv.split("\r" + "\n");
        headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {
          if (!lines[i]) continue;
          let obj = {};
          currentline = lines[i];
          var re = /"/g;
          currentline = re[Symbol.replace](currentline, "");
          currentline = currentline.split(",");

          for (var j = 0; j < headers.length; j++) {
            if (j == 0 || j == 1 || j == 2 || j == 3 || j == 4) {
              let head = headers[j].trim();
              let value = currentline[j].trim();
              obj[head] = value;
            }
          }
          result.push(obj);
        }

        result = JSON.stringify(result);
        console.log("the result is: ");
        result2 = JSON.parse(result);
        console.log(result);
        console.log(result2);

        for (i = 0; i < result2.length; i++) {
          this.heuristics.push(Object.assign({}, result2[i]));
          this.itemSelect = this.heuristics.length - 1;

          this.heuristics.total = this.totalQuestions;
        }
      };
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
