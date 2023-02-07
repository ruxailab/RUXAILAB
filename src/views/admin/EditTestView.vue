<template>
    <v-container>
        {{ test }}
        <Snackbar />
        <!-- Leave Alert Dialog -->
        <v-dialog v-model="dialog" width="600" persistent>
            <v-card>
                <v-card-title
                    class="headline error accent-4 white--text"
                    primary-title
                    >Are you sure you want to leave?</v-card-title
                >

                <v-card-text>All your changes will be discarded</v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="grey lighten-3" text @click="dialog = false"
                        >Stay</v-btn
                    >
                    <v-btn
                        class="error accent-4 white--text ml-1"
                        text
                        @click="(change = false), $router.push(go)"
                        >Leave</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Save button -->
        <v-tooltip left v-if="change">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    large
                    dark
                    fab
                    fixed
                    bottom
                    right
                    color="#F9A826"
                    @click="validateAll()"
                    v-bind="attrs"
                    v-on="on"
                >
                    <v-icon large>mdi-content-save</v-icon>
                </v-btn>
            </template>
            <span>Save</span>
        </v-tooltip>

        <!-- Loading Overlay -->
        <v-overlay class="text-center" v-model="loading">
            <v-progress-circular
                indeterminate
                color="#fca326"
                size="50"
            ></v-progress-circular>
            <div class="white-text mt-3">Loading Test</div>
        </v-overlay>

        <!--
        <IntroEdit v-if="test && intro == true" @closeIntro="intro = false" />
          <IntroEdit v-if="test.testStructure" @closeIntro="intro = false" />  --> 
   
 <!--
        <ShowInfo v-if="test" title="Test Edit">  --> 
            <!-- Heuristics tests -->
            <!--TODO: change hard coded type
            <EditHeuristicsTest
                v-if="test.testType == "HEURISTICS""
                type="tabs"
                @tabClicked="setIndex"
                slot="top"
            />
        -->
        <v-row>
          <v-col cols="12">
            <EditHeuristicsTest
                v-if="test.testType === 'HEURISTICS'"
                type="content"
                :object="object"
                :index="index"
                @change="change = true"
                slot="content"
            />
          </v-col>
            <!-- User tests
            <EditUserTest
                v-if="test.type === 'User'"
                type="tabs"
                @tabClicked="setIndex"
                slot="top"
            />

            <EditUserTest
                v-if="test.type === 'User'"
                :object="object"
                :index="index"
                type="content"
                @change="change = true"
                @valForm="validate"
                slot="content"
            />
             -->
       <!-- </ShowInfo>  --> 
      </v-row>
            </v-container>
</template>

<script>
import Snackbar from "@/components/atoms/Snackbar";
//import ShowInfo from "@/components/organisms/ShowInfo";
//import IntroEdit from "@/components/molecules/IntroEdit.vue";
import EditHeuristicsTest from "@/components/organisms/EditHeuristicsTest";
//import EditUserTest from "@/components/organisms/EditUserTest";

export default {
    props: ["id"],
    components: {
        Snackbar,
        //ShowInfo,
        //IntroEdit,
        EditHeuristicsTest,
        //EditUserTest,
    },
    data: () => ({
        index: 0,
        object: {},
        valids: [true, true],
        change: false,
        dialog: false,
        intro: null,
    }),
    methods: {
        async submit() {
            let today = new Date();

            if (this.object.date !== today.toDateString())
                this.object.date = today.toDateString(); //update date if not the same as last update

            if ("template" in this.object)
                this.object.template.upToDate = false; //flag as outdated
            this.object.answersSheet = await this.mountAnswerSheet(); //update object answersheet
            this.$store
                .dispatch("updateTest", {
                    docId: this.id,
                    data: this.object,
                })
                .then(async () => {
                    this.answers.answersSheet = await this.mountAnswerSheet();
                    if (this.test.type === "HEURISTICS")
                        Object.assign(this.answers, {
                            options: this.object.options,
                        });
                    this.$store.Test.dispatch("updateTestAnswer", {
                        docId: this.test.answers,
                        data: this.answers,
                    })
                        .then(() => {
                            this.$store.commit(
                                "setSuccess",
                                "Test updated succesfully"
                            );
                            this.change = false;
                        })
                        .catch((err) => {
                            this.$store.commit("setError", err);
                        });
                })
                .catch((err) => {
                    this.$store.commit("setError", err);
                });
        },
        mountAnswerSheet() {
            let aux = {
                heuristics: [],
                tasks: [],
                progress: 0,
                total: this.totalQuestions,
            };

            if (this.object?.heuristics) {
                this.object.heuristics.forEach((heuris) => {
                    let questions = Array.from(heuris.questions);
                    let arrayQuestions = [];

                    questions.forEach((el) => {
                        arrayQuestions.push(
                            Object.assign({}, { id: el.id, res: "", com: "" })
                        );
                    });

                    aux.heuristics.push(
                        Object.assign(
                            {},
                            {
                                id: heuris.id,
                                total: heuris.total,
                                questions: arrayQuestions,
                            }
                        )
                    );
                });

                delete aux.tasks;
            } else if (this.object?.tasks) {
                aux.tasks = [...this.object.tasks];
                delete aux.heuristics;
            }

            return aux;
        },
        validate(valid, index) {
            this.valids[index] = valid;
        },
        validateAll() {
            if (this.test.type === "User" && !this.valids[0]) {
                this.$store.commit(
                    "setError",
                    "Please fill all fields in Pre Test correctly or leave them empty"
                );
            } else if (
                this.test.type === "HEURISTICS" &&
                this.object.options.length == 1
            ) {
                this.$store.commit(
                    "setError",
                    "Please create at least 2 options or none at all"
                );
            } else if (this.test.type === "User" && !this.valids[1]) {
                this.$store.commit(
                    "setError",
                    "Please fill all fields in Post Test correctly or leave them empty"
                );
            } else {
                this.submit();
            }
        },
        preventNav(event) {
            if (!this.change) return;
            event.preventDefault();
            event.returnValue = "";
        },
        async setIntro() {
            this.object = await Object.assign(this.object, this.test);
            if (this.test.type === "HEURISTICS") {
                if (
                    this.test.heuristics.length == 0 &&
                    this.test.options.length == 0
                )
                    this.intro = true;
                else this.intro = false;
            } else if (this.test.type === "User") {
                if (
                    this.test.tasks.length == 0 &&
                    this.test.postTest.form == null &&
                    this.test.preTest.consent == null &&
                    this.test.preTest.form == null
                )
                    this.intro = true;
                else this.intro = false;
            }
        },
        setIndex(ind) {
            this.index = ind;
        },
    },
    watch: {
        test: async function() {
            if (this.test !== null && this.test !== undefined) {
                this.setIntro();
            }
        },
    },
    computed: {
        loading() {
            return this.$store.getters.loading;
        },
        user() {
            return this.$store.getters.user;
        },
        test() {
            console.log(this.$store.getters.test);
            return this.$store.getters.test;
        },
        answers() {
            return this.$store.getters.answers || [];
        },
        totalQuestions() {
            let result = 0;
            if (this.object?.heuristics) {
                this.object?.heuristics.forEach((h) => {
                    result += h.total;
                });
            } else if (this.object?.tasks) {
                this.object?.tasks.forEach((h) => {
                    result += h.total;
                });
            }

            return result;
        },
    },
    async created() {
        //await this.$store.dispatch("getAnswers", { id: this.test.answersDocId});
        await this.$store.dispatch("getTest", { id: this.id });

        //this.setIntro();
    },
    beforeRouteLeave(to, from, next) {
        if (this.change) {
            this.dialog = true;
            this.go = to.path;
        } else {
            next();
        }
    },
    beforeMount() {
        window.addEventListener("beforeunload", this.preventNav);
    },
    beforeDestroy() {
        window.removeEventListener("beforeunload", this.preventNav);
    },
};
</script>
