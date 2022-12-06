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
import Heuristic from "@/models/Heuristic";
import HeuristicQuestion from "@/models/HeuristicQuestion";

// import HeuristicTest from "@/models/HeuristicTest";
//import HeuristicController from "@/controllers/HeuristicController";
// import { getDatabase, ref, set } from "firebase/database";
// import { doc, setDoc } from "firebase/firestore";

//const heuristicC = new HeuristicController();

export default {
  data() {
    return {
      loading: false,
      loader: null,
      csvFile: null,
      heuristicForm: null,
      refs: this.$refs,
    };
  },

  methods: {
    // writeNewHeuristic(answerId, HID, QID) {
    //   const db = getDatabase();
    //   set(ref(db, "answers/anserSheet" + answerId), {
    //     heuristics: HID,
    //   });
    //   set(ref(db, "answers/anserSheet/heuristics" + HID), {
    //     id: QID,
    //   });
    // },         --->não funcionou

    async changeToJSON() {
      const testId = this.$route.params.id;
      console.log(this.user);
      console.log("testId", testId);

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

      reader.onload = async (csvFile) => {
        console.log(csvFile);
        csv = reader.result;
        lines = csv.split("\r" + "\n");
        console.log(lines[0]);
        headers = lines[0].split(";");
        console.log("headers: ");
        headers[0] = headers[0].slice(3);
        console.log(headers);

        for (var i = 1; i < lines.length; i++) {
          if (!lines[i]) continue;
          let obj = {};
          currentline = lines[i];
          var re = /"/g;
          currentline = re[Symbol.replace](currentline, "");
          currentline = currentline.split(";");

          for (var j = 0; j < headers.length; j++) {
            if (j == 0 || j == 1 || j == 2 || j == 3) {
              let head = headers[j];
              let value = currentline[j];
              obj[head] = value;
            }
          }
          result.push(obj);
        }

        result = JSON.stringify(result);
        console.log("the result is: ");
        result2 = JSON.parse(result.toString());
        console.log(result);

        console.log(result2);

        const found=result2.find(element=> element.HID ==="1")
        console.log(found)

        function getQuestionsFromHeuristic(heuristicArray, heuristicId){
          return heuristicArray.filter(element=>element.HID == heuristicId)
        }
        let heuristicTest=[]
        let heuristicOcurrencies = 0

        for(i=0;i<result2.length;i++){
          console.log(i)
          let auxHeuristic=getQuestionsFromHeuristic(result2, i+1)
          if(auxHeuristic.length>0){
            heuristicOcurrencies=heuristicOcurrencies+1
            let auxQuestions=[]
            for(j=0;j<auxHeuristic.length;j++){
              let auxQuestion= new HeuristicQuestion(auxHeuristic[j].QID,auxHeuristic[j].QUESTION,auxHeuristic[j].QUESTION,auxHeuristic[j].QUESTION )
              auxQuestions.push(auxQuestion)
            }
            console.log(auxQuestions)
            let setHeuristics= new Heuristic(heuristicOcurrencies, auxHeuristic[0].HEURISTIC, auxQuestions,auxQuestions.length )
            heuristicTest.push(setHeuristics)
            console.log(heuristicTest)
            console.log('----')
          }
       
  
       }

/*
        heuristicC.createNewHeuristic({
          id: result2.HID,
          questions: { id: result2.QID, res: result2.QUESTION },
        });
*/
        this.$store.dispatch('saveCurrentTest',heuristicTest)
        console.log('----')


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
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
    },
  },
};
</script>
