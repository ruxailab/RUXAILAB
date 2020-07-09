<template>
  <v-container v-if="test" class="ma-0 pa-0">
    <v-snackbar v-model="snackbar" :color="snackColor" top :timeout="2000">
      <p>{{ snackMsg }}</p>
      <v-btn text @click="snackbar = false">
        <v-icon>mdi-close-circle-outline</v-icon>
      </v-btn>
    </v-snackbar>
    <v-btn large dark fab fixed bottom right color="#F9A826" @click=" send()">
      <v-icon large>mdi-email</v-icon>
    </v-btn>
    <ShowInfo title="Cooperators">
      <FormCooperation :invitations="invitations" />
    </ShowInfo>
  </v-container>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";
import FormCooperation from "@/components/atoms/FormCooperation.vue";

export default {
  props: ["id"],
  components: {
    ShowInfo,
    FormCooperation
  },
  data: () => ({
    object: null,
    change: false,
    valids: [false, true, true],
    snackbar: false,
    snackMsg: "",
    snackColor: "",
    invitations: []
  }),
  methods: {
    validate(valid, index) {
      this.valids[index] = valid;
    },
    async submit() {
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
        });
    },
    send() {
      let removed = this.object.coop.filter(e => !this.invitations.includes(e));
      let invite = this.invitations.filter(e => !this.object.coop.includes(e));

      removed.forEach(item => {
        this.$store.dispatch("removeMyCoops", {
          docId: item.id,
          element: {
            id: this.id,
            title: this.object.title,
            type: this.object.type,
            reports: this.object.reports,
            answers: this.object.answers,
            accessLevel: this.object.accessLevel
          }
        });
      });

      invite.forEach(item => {
        let inv = {
          to: {
            id: item.id,
            email: item.email,
            accessLevel: item.accessLevel
          },
          from: {
            id: this.user.uid,
            email: this.user.email
          },
          test: {
            id: this.id,
            title: this.object.title,
            type: this.object.type,
            reports: this.object.reports,
            answers: this.object.answers
          }
        };
        this.$store.dispatch("pushNotification", {
          docId: inv.to.id,
          element: inv,
          param: "notifications"
        });
      });

      removed.forEach(item => {
        this.object.coop.splice(this.testEdit.coop.indexOf(item), 1);
      });
    }
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test);
        this.invitations = Array.from(this.test.coop);
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
</style>