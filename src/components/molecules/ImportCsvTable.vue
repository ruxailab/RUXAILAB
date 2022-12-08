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
// import Heuristic from "@/models/Heuristic";
import HeuristicTest from "@/models/HeuristicTest";

export default {
  data() {
    return {
      loading: false,
      loader: null,
      csvFile: null,
      heuris: null,
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
        console.log("putputput");
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
            if (j == 0 || j == 1 || j == 2 || j == 3 ) {
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
        console.log(result2[0].HEURISTIC);

        const separetion = result2[0].HEURISTIC.split(";");
        console.log(separetion);

        result2.forEach((element) => {
          const separetion = element.HEURISTIC.split(";");

          console.log(separetion);
          console.log(element + " separetion 0");
          console.log(separetion[1] + " separetion 1");

          this.heuris.title = result2[0].HEURISTIC.split(";")[0];
          console.log(this.heuris.title);
          this.heuristics.push(Object.assign({}, element));
          this.itemSelect = this.heuristics.length - 1;

          this.heuristics.total = this.totalQuestions;
        });
        const hTest = new HeuristicTest();
        console.log(hTest);
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
