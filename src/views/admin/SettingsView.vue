<template>
  <v-container v-if="test">
    <v-snackbar v-model="snackbar" :color="snackColor" top :timeout="2000">
      <p>{{ snackMsg }}</p>
      <v-btn text @click="snackbar = false">
        <v-icon>mdi-close-circle-outline</v-icon>
      </v-btn>
    </v-snackbar>
    <v-row justify="space-around">
      <v-col cols="12" class="titleView">Settings</v-col>
    </v-row>
    <v-divider></v-divider>
    <v-row justify="center">
      <v-col cols="12">
        <v-card class="dataCard">
          <v-col class="mb-1 pa-4 pb-1">
            <p class="subtitleView">Current Test</p>
          </v-col>
          <v-divider></v-divider>
          <FormTestDescription
            v-if="object"
            :test="object"
            @valForm="validate"
            ref="form1"
            :lock="true"
            @change="change = true"
          />
        </v-card>
        <v-btn v-if="change" large dark fab fixed bottom right color="#F9A826" @click=" submit()">
          <v-icon large>mdi-content-save</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";

export default {
  props: ["id"],
  components: {
    FormTestDescription
  },
  data: () => ({
    object: null,
    change: false,
    valids: [false, true, true],
    snackbar: false,
    snackMsg: "",
    snackColor: ""
  }),
  methods: {
    validate(valid, index) {
      this.valids[index] = valid;
    },
    async submit() {
      await this.$store.dispatch("getAnswers", { id: this.test.answers });
      await this.$store.dispatch("getReports", { id: this.test.reports });

      this.snackMsg = "Test updated succesfully";
      this.snackColor = "success";
      this.snackbar = true;

      this.$store
        .dispatch("updateTest", {
          docId: this.id,
          data: this.object
        })
        .then(() => {
          this.$store.dispatch("updateMyTest", {
            docId: this.object.admin.id,
            element: {
              id: this.id,
              title: this.object.title,
              type: this.object.type,
              reports: this.object.reports,
              answers: this.object.answers,
              accessLevel: 0
            }
          });

          this.object.coop.forEach(coop => {
            this.$store.dispatch("updateMyCoops", {
              docId: coop.id,
              element: {
                id: this.id,
                title: this.object.title,
                type: this.object.type,
                reports: this.object.reports,
                answers: this.object.answers,
                accessLevel: coop.accessLevel
              }
            });
          });

          this.answers.test.title = this.object.title;
          this.reports.test.title = this.object.title;
          this.$store.dispatch("updateTestAnswer", {
            docId: this.test.answers,
            data: this.answers
          });

          this.$store.dispatch("updateTestReport", {
            docId: this.test.reports,
            data: this.reports
          });
        });
    }
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test);
      }
    },
    snackbar() {
      if (this.snackbar === false && this.snackColor == "success")
        this.change = false;
    }
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
    },
    answers() {
      return this.$store.state.answers.answers || [];
    },
    reports() {
      return this.$store.state.reports.reports || [];
    }
  },
  created() {
    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      this.$store.dispatch("getTest", { id: this.id });
    }
  }
};
</script>

<style scoped>
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
.subtitleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}

.dataCard {
  background: #f5f7ff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  margin: 10px;
  padding-bottom: 10px;
  min-height: 550px;
}
</style>