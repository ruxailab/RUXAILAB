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
import HeuristicController from "../../controllers/HeuristicController";


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
        async changeToJSON() {
            const testId = this.test.id;

            console.log(testId);

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

                function getQuestionsFromHeuristic(
                    heuristicArray,
                    heuristicId
                ) {
                    return heuristicArray.filter(
                        (element) => element.HID == heuristicId
                    );
                }
                let heuristicTest = [];
                let heuristicOcurrencies = 0;

                for (i = 0; i < result2.length; i++) {
                    let auxHeuristic = getQuestionsFromHeuristic(
                        result2,
                        i + 1
                    );
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
                        console.log(setHeuristics);
                    }
                }

                console.log(this.test);

                this.$store.dispatch("saveCurrentTest", heuristicTest);
                console.log(testId);
                console.log(heuristicTest);
                console.log(heuristicTest);

                for (i = 0; i < heuristicTest.length; i++) {
                    console.log(heuristicTest[i].id);
                    let aux = Array.of(heuristicTest[i].total);
                    for (j = 0; j < heuristicTest[i].total; j++) {
                        console.log(heuristicTest[i].questions[j]);

                        aux[j] = {
                            id: heuristicTest[i].questions[j].id,
                            res: heuristicTest[i].questions[j].title,
                            com: heuristicTest[i].questions[j].descriptions,
                        };
                        console.log("auxiliar: " + aux);
                    }
                    await new HeuristicController().createCsvHeuris({
                        testId: testId,
                        id: heuristicTest[i].id,
                        questions: aux,
                        title: heuristicTest[i].title,
                        total: heuristicTest[i].total,
                    });
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
                alert(
                    "No csv file selected. \nPlease select one before procede."
                );
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
