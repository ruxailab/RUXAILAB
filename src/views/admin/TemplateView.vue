<template>
  <v-container v-if="test">
    <Dialog :dialog="dialogDel" :text="dialogText">
      <v-card-title
        slot="title"
        class="headline error white--text"
        primary-title
      >Are you sure you want to delete this template?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialogDel = false">Cancel</v-btn>
        <v-btn
          class="red white--text ml-1"
          :loading="loading"
          text
          @click="deleteTest(object), loading = true"
        >Delete</v-btn>
      </div>
    </Dialog>
    <Dialog
      :dialog="dialogAlert"
      text="Are you sure you want to leave? All your changes will be discarded"
    >
      <v-card-title
        slot="title"
        class="headline error accent-4 white--text"
        primary-title
      >Are you sure you want to leave?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialogAlert = false">Stay</v-btn>
        <v-btn
          class="error accent-4 white--text ml-1"
          text
          @click="change = false,$router.push(go)"
        >Leave</v-btn>
      </div>
    </Dialog>

    <ShowInfo title="Template"></ShowInfo>
    <div slot="content">
      <v-card style="background: #f5f7ff">
        <v-col class="mb-1 pa-4 pb-1">
          <p class="subtitleView">Settings</p>
        </v-col>
        <v-divider></v-divider>
        <div>{{template}}</div>
        <div>{{object}}</div>
        <v-divider></v-divider>
        <v-row justify="center">
          <v-btn
            color="#f26363"
            class="white--text mb-4"
            style="justify-self: center"
            @click="dialogDel = true"
          >
            <v-icon left>mdi-trash-can-outline</v-icon>Delete template
          </v-btn>
        </v-row>
      </v-card>
      <v-tooltip left v-if="change">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="change"
            large
            dark
            fab
            fixed
            bottom
            right
            color="#F9A826"
            @click=" update()"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon large>mdi-content-save</v-icon>
          </v-btn>
        </template>
        <span>Save</span>
      </v-tooltip>
    </div>
  </v-container>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo";
import Dialog from "@/components/atoms/Dialog";

export default {
  props: ["id"],
  components: {
    ShowInfo,
    Dialog
  },
  data: () => ({
    change: true,
    dialogDel: false,
    dialogAlert: false,
    loading: false,
    object: null
  }),
  methods: {
    update() {
      let payload = Object.assign({}, this.template);

      payload.header.version = "1.0.1";
      payload.header.date = new Date().toLocaleString("en-US");

      if (this.test.type == "Expert") {
        Object.assign(payload.template, {
          heeuristics: this.test.heuristics,
          options: this.test.options,
          answersSheet: this.test.answersSheet,
          type: this.test.type
        });
      } else if (this.test.type == "User") {
        Object.assign(payload.template, {
          tasks: this.test.tasks,
          preTest: this.test.preTest,
          postTest: this.test.postTest,
          type: this.test.type
        });
      }

        this.$store.dispatch("updateTemplate", {
          docId: this.id,
          data: payload
        });
      
    }
  },
  computed: {
    template() {
      return this.$store.getters.template;
    },
    test() {
      return this.$store.getters.test;
    },
    dialogText() {
      if (this.object)
        return `Are you sure you want to delete your template ? This action can't be undone`;

      return `Are you sure you want to delete this template? This action can't be undone`; //in case object isnt loaded
    }
  },
  watch: {
    test: async function() {
      if (this.test !== null && this.test !== undefined) {
        this.object = await Object.assign({}, this.test);
      }
    }
  },
  created() {
    if (!this.$store.getters.template) {
      this.$store.dispatch("getTemplate", { id: this.id });
    }

    if (!this.$store.test && this.id !== null && this.id !== undefined) {
      this.$store.dispatch("getTest", {
        id: this.$store.state.auth.user.myTests.find(
          test => test.template == this.id
        ).id
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.change) {
      this.dialogAlert = true;
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