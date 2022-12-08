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

// import { doc, setDoc } from "firebase/firestore";
import firebase from "firebase";

export default {
  data() {
    return {
      // test: {
      //   title: "",
      //   description: "",
      //   type: "",
      // },
      loading: false,
      loader: null,
      csvFile: null,
      heuristicForm: null,
      refs: this.$refs,
    };
  },

  methods: {
    // async submit() {
    //   let i;
    //   await this.testAssembly(); // build Test
    //   let d = new Date();
    //   let object = this.csvHeuristics;
    //   let successful = true;
    //   //Send db
    //   await this.$store
    //     .dispatch("createTest", {
    //       collection: "test",
    //       data: Object.assign(object, { date: d.toDateString() }),
    //     })
    //     .then((id) => {
    //       this.testID = id;
    //       for (i = 0; i < this.csvHeuristics.length; i++) {
    //         this.$store
    //           .dispatch("createAnswers", {
    //             data: {
    //               test: {
    //                 id: id,
    //                 title: object[i].title,
    //                 type: "Heuristics",
    //               },
    //               answers: [],
    //               answersSheet: object[i].answersSheet,
    //             },
    //           })
    //           .then((idAnswers) => {
    //             this.$store.dispatch("setAnswerID", {
    //               docId: id,
    //               data: idAnswers,
    //             });
    //             this.$store
    //               .dispatch("createReport", {
    //                 data: {
    //                   test: {
    //                     id: id,
    //                     title: object.title,
    //                     type: object.type,
    //                     answers: idAnswers,
    //                   },
    //                   reports: [],
    //                 },
    //               })
    //               .then((idReport) => {
    //                 this.$store.dispatch("setReportID", {
    //                   docId: id,
    //                   data: idReport,
    //                 });
    //                 this.$store
    //                   .dispatch("createCooperators", {
    //                     data: {
    //                       test: {
    //                         id: id,
    //                         title: object.title,
    //                         type: object.type,
    //                       },
    //                       cooperators: [],
    //                     },
    //                   })
    //                   .then((idCooperators) => {
    //                     this.$store.dispatch("setCooperatorsID", {
    //                       docId: id,
    //                       data: idCooperators,
    //                     });
    //                     this.$store.dispatch("pushMyTest", {
    //                       docId: this.user.uid,
    //                       element: {
    //                         id: id,
    //                         title: object.title,
    //                         type: object.type,
    //                         reports: idReport,
    //                         answers: idAnswers,
    //                         cooperators: idCooperators,
    //                         accessLevel: 0,
    //                         date: d.toDateString(),
    //                         nCoops: 0,
    //                       },
    //                       param: "myTests",
    //                     });
    //                   });
    //               });
    //           });
    //       }
    //     })
    //     .catch((err) => {
    //       console.error("Error", err);
    //       successful = false;
    //     });

    //   if (successful) this.sendManager(this.testID);
    // },

    // testAssembly() {
    //   //Make object test
    //   //Assigning admin info

    //   if (this.id === null || this.id === undefined) {
    //     this.csvHeuristics = Object.assign(this.csvHeuristics, {
    //       admin: {
    //         id: this.user.uid,
    //         email: this.user.email,
    //       },
    //     });
    //   }

    //   //Assigning test info
    //   this.csvHeuristics = Object.assign(this.csvHeuristics, this.test);
    //   this.object = Object.assign(this.object, {
    //     date: new Date().toDateString(),
    //   });

    //   //assigning tasks/heuristics
    //   if (this.test.type === "User") {
    //     //assigning pre-test info
    //     this.object = Object.assign(this.object, {
    //       preTest: {
    //         consent: null,
    //         form: null,
    //       },
    //     });

    //     this.object = Object.assign(this.object, {
    //       tasks: [],
    //       answersSheet: null,
    //     });

    //     //assigning post test
    //     this.object = Object.assign(this.object, {
    //       postTest: {
    //         form: null,
    //       },
    //     });
    //   } else if (this.test.type === "Heuristics") {
    //     this.object = Object.assign(this.object, {
    //       heuristics: [],
    //       answersSheet: {
    //         total: 0,
    //         progress: 0,
    //         heuristics: [],
    //       },
    //     });

    //     this.object = Object.assign(this.object, { options: [] });
    //   }
    // },
    async changeToJSON() {
      const db = firebase.firestore();
      // const testId = this.$route.params.id;
      let lines = "";
      let currentline = "";
      let csv = "";
      let headers = "";
      let result = [];
      let result2 = [];
      let reader = new FileReader();

      reader.readAsBinaryString(this.csvFile);

      reader.onload = async () => {
        csv = reader.result;
        lines = csv.split("\r" + "\n");
        headers = lines[0].split(";");
        headers[0] = headers[0].slice(3);

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
        result2 = JSON.parse(result.toString());

        function getQuestionsFromHeuristic(heuristicArray, heuristicId) {
          return heuristicArray.filter((element) => element.HID == heuristicId);
        }
        let heuristicTest = [];
        let heuristicOcurrencies = 0;

        for (i = 0; i < result2.length; i++) {
          let auxHeuristic = getQuestionsFromHeuristic(result2, i + 1);
          if (auxHeuristic.length > 0) {
            heuristicOcurrencies = heuristicOcurrencies + 1;
            let auxQuestions = [];
            for (j = 0; j < auxHeuristic.length; j++) {
              let auxQuestion = new HeuristicQuestion(
                auxHeuristic[j].QID,
                auxHeuristic[j].QUESTION,
                auxHeuristic[j].QUESTION,
                auxHeuristic[j].QUESTION
              );
              auxQuestions.push(auxQuestion);
            }
            let setHeuristics = new Heuristic(
              heuristicOcurrencies,
              auxHeuristic[0].HEURISTIC,
              auxQuestions,
              auxQuestions.length
            );
            heuristicTest.push(setHeuristics);
          }
        }

        console.log(heuristicTest);
        console.log(heuristicTest[0].id);
        console.log("csvHeuristics: ");
        console.log(this.csvHeuristics[0].questions);
        // const db = firebase.firestore();
        // await setDoc(doc(db, "answers", "answersSheet"), {
        //   heuristics: heuristicTest[0].id,
        // });
        this.$store.dispatch("saveCurrentTest", heuristicTest);

        db.collection("cities")
          .doc("LA")
          .set({
            name: "Los Angeles",
            state: "CA",
            country: "USA",
          })
          .then(() => {
            console.log("Document successfully written!");
          })
          .catch((error) => {
            console.error("Error writing document: ", error);
          });
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
    csvHeuristics() {
      return this.$store.state.Tests.currentTest;
    },
  },
};
</script>
