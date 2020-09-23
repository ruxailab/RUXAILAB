<template>
  <div>
    <v-overlay class="text-center" v-model="loading">
      <v-progress-circular indeterminate color="#fca326" size="50"></v-progress-circular>
      <div class="white-text mt-3">Loading Cooperators</div>
    </v-overlay>
    <Intro v-if="cooperatorsEdit.length == 0 && intro && !loading" @closeIntro="intro = false" />

    <v-row justify="center" v-else-if="cooperators">
      <v-container class="ma-0 pa-0">
        <Snackbar />

        <!-- Leave alert dialog -->
        <v-dialog v-model="dialog" width="600" persistent>
          <v-card>
            <v-card-title
              class="headline error accent-4 white--text"
              primary-title
            >Are you sure you want to leave?</v-card-title>

            <v-card-text>Are you sure you want to leave? All your changes will be discarded</v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="grey lighten-3" text @click="dialog = false">Stay</v-btn>
              <v-btn
                class="error accent-4 white--text ml-1"
                text
                @click="change = false,$router.push(go)"
              >Leave</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
              @click="submit(), change = false"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon large>mdi-email</v-icon>
            </v-btn>
          </template>
          <span>Send invitations</span>
        </v-tooltip>

        <ShowInfo title="Cooperators">
          <div class="ma-0 pa-0" style="background: #f5f7ff;" slot="content">
            <v-combobox
              :hide-no-data="false"
              style="background: #f5f7ff;"
              v-model="email"
              :items="filteredUsers"
              item-text="email"
              label="Add cooperator"
              @keydown.native.enter="pushToArray()"
              ref="combobox"
              dense
              color="#fca326"
              prepend-icon="mdi-account-multiple-plus"
              class="mx-4 pt-4"
            >
              <template
                v-slot:no-data
              >There are no users registered with that email, press enter to add anyways.</template>
            </v-combobox>
            <v-data-table
              dense
              style="background: #f5f7ff;"
              :items="cooperatorsEdit"
              :headers="headers"
              height="450px"
              :items-per-page="7"
              items-per-page-text="7"
              :footer-props="{ 
          'items-per-page-options': [7]
        }"
            >
              <!-- Email -->
              <template v-slot:item.email="{ item }">
                <v-row align="center">
                  <v-icon class="mr-2">mdi-account-circle</v-icon>
                  <div>{{item.email}}</div>
                </v-row>
              </template>

              <!-- Role -->
              <template v-slot:item.accessLevel="{ item }">
                <v-select
                  color="#fca326"
                  style="max-width: 200px"
                  @input="setValue"
                  @change="recordChange(Object.assign({},item))"
                  :value="item.accessLevel"
                  return-object
                  dense
                  :items="roleOptions"
                  :v-text="item.accessLevel.text"
                  :disabled="!item.invited || item.accepted ? false : true"
                  class="mt-3"
                ></v-select>
              </template>

              <!-- Invited -->
              <template v-slot:item.invited="{ item }">
                <v-icon color="#8EB995" v-if="item.invited">mdi-checkbox-marked-circle-outline</v-icon>
                <v-icon color="#F47C7C" v-else>mdi-close-circle-outline</v-icon>
              </template>

              <!-- Accepted -->
              <template v-slot:item.accepted="{ item }">
                <v-icon
                  color="#F9A826"
                  v-if="item.accepted == null"
                >mdi-checkbox-blank-circle-outline</v-icon>
                <v-icon color="#8EB995" v-else-if="item.accepted">mdi-checkbox-marked-circle-outline</v-icon>
                <v-icon color="#F47C7C" v-else>mdi-close-circle-outline</v-icon>
              </template>

              <!-- More -->
              <template v-slot:item.more="{ item }">
                <v-menu>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item @click="removeFromList(item)" v-if="!item.invited">
                      <v-list-item-title>Cancel invitation</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      @click="reinvite(item)"
                      link
                      v-if="item.invited && item.accepted == false"
                    >
                      <v-list-item-title>Re-invite</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      @click="removeCoop(item),removeFromList(item)"
                      v-if="item.accepted != null"
                    >
                      <v-list-item-title>Remove cooperator</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      @click="cancelInvitation(item)"
                      v-if="item.invited && item.accepted == null"
                    >
                      <v-list-item-title>Cancel invitation</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </div>
        </ShowInfo>
      </v-container>
    </v-row>
  </div>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";
import Snackbar from "@/components/atoms/Snackbar";
import Intro from "@/components/molecules/IntroCoops";

export default {
  props: ["id"],
  components: {
    ShowInfo,
    Snackbar,
    Intro
  },
  data: () => ({
    object: null,
    change: false,
    edited: null,
    cooperatorsEdit: [],
    editedCoops: [],
    deletedCoops: [],
    userSelected: {},
    headers: [
      { text: "User", value: "email" },
      { text: "Role", value: "accessLevel" },
      { text: "Invited", value: "invited", justify: "center" },
      { text: "Accepted", value: "accepted", justify: "center" },
      { text: "More", value: "more", sortable: false },
    ],
    roleOptions: [
      { text: "Evaluator", value: 2 },
      { text: "Guest", value: 1 },
      { text: "Administrator", value: 0 },
    ],
    dialog: false,
    loading: true,
    intro: null,
    email: "",
  }),
  methods: {
    setValue(value) {
      this.edited = value;
    },
    submit() {
      this.cooperatorsEdit.forEach((guest) => {
        //Invide new cooperators
        if (!guest.invited) {
          this.send(guest);
        }
      });

      this.editedCoops.forEach((guest) => {
        this.edit(guest);
      });

      this.deletedCoops.forEach((guest) => {
        this.remove(guest);
      });

      this.editedCoops = [];
      this.deletedCoops = [];
      this.change = false;
    },
    remove(guest) {
      if (guest.accessLevel.value != 2) {
        this.$store
          .dispatch("removeMyCoops", {
            docId: guest.id,
            element: {
              id: this.testID.id,
            },
          })
          .then(() => {
            //Remove element array
            this.$store.dispatch("removeCooperator", {
              docId: this.id,
              element: {
                id: guest.id,
              },
            });
          });
      } else {
        this.$store
          .dispatch("removeMyAnswers", {
            docId: guest.id,
            element: {
              id: this.testID.id,
            },
          })
          .then(() => {
            this.$store
              .dispatch("removeReport", {
                docId: this.testID.reports,
                element: {
                  id: guest.id,
                },
                param: "reports",
              })
              .then(() => {
                this.$store.dispatch("removeCooperator", {
                  docId: this.id,
                  element: {
                    id: guest.id,
                  },
                });
              });
          });
      }
    },
    edit(guest) {
      this.$store
        .dispatch("updateCooperator", {
          docId: this.id,
          elementId: guest.guest.id,
          element: guest.current,
          param: "accessLevel",
        })
        .then(() => {
          // Cooperator was Tester
          if (guest.previous.value == 2) {
            this.$store
              .dispatch("removeMyAnswers", {
                docId: guest.guest.id,
                element: {
                  id: this.testID.id,
                },
              })
              .then(() => {
                this.$store.dispatch("removeReport", {
                  docId: this.testID.reports,
                  element: {
                    id: guest.id,
                  },
                  param: "reports",
                });
                let test = Object.assign({}, this.testID);
                this.$store.dispatch("pushMyCoops", {
                  docId: guest.guest.id,
                  element: Object.assign(test, {
                    accessLevel: guest.current.value,
                  }),
                });
              });
          } else if (
            //I'll be a Tester
            (guest.previous.value == 1 || guest.previous.value == 0) &&
            guest.current.value == 2
          ) {
            this.$store
              .dispatch("removeMyCoops", {
                docId: guest.guest.id,
                element: {
                  id: this.testID.id,
                },
              })
              .then(() => {
                let test = Object.assign({}, this.testID);
                this.$store.dispatch("pushMyAnswers", {
                  docId: guest.guest.id,
                  element: Object.assign(test, {
                    answersSheet: Object.assign(this.test.answersSheet, {
                      submited: false,
                    }),
                    accessLevel: 2,
                  }),
                });

                let item = Object.assign(
                  {},
                  {
                    uid: guest.guest.id,
                    email: guest.guest.email,
                    log: {
                      date: new Date().toLocaleString("en-Us"),
                      progress: 0,
                      status: "In progress",
                    },
                  }
                );
                this.$store.dispatch("pushLog", {
                  docId: this.testID.reports,
                  element: item,
                });
              });
          } else if (guest.previous.value != 2 && guest.current.value != 2) {
            this.$store.dispatch("updateAccessLevel", {
              docId: guest.guest.id,
              elementId: this.id,
              element: guest.current.value,
              param: "accessLevel",
            });
          }
        });
    },
    send(guest) {
      if (guest.id) {
        const UIDGenerator = require("uid-generator");
        const uidgen = new UIDGenerator();
        let invID = uidgen.generateSync();
        let inv = {
          id: invID,
          to: {
            id: guest.id,
            email: guest.email,
            accessLevel: guest.accessLevel.value,
          },
          from: {
            id: this.user.uid,
            email: this.user.email,
          },
          test: {
            id: this.test.id,
            title: this.test.title,
            type: this.test.type,
            reports: this.test.reports,
            answers: this.test.answers,
            cooperators: this.test.cooperators,
          },
        };
        this.$store
          .dispatch("pushNotification", {
            docId: inv.to.id,
            element: inv,
            param: "notifications",
          })
          .then(() => {
            this.$set(guest, "invited", true);
            Object.assign(guest, { invitation: invID });
            //Access Level Tester
            if (guest.accessLevel.value == 2) {
              let item = Object.assign(
                {},
                {
                  uid: guest.id,
                  email: guest.email,
                  log: {
                    date: new Date().toLocaleString("en-Us"),
                    progress: 0,
                    status: "Invited",
                  },
                }
              );
              this.$store.dispatch("pushLog", {
                docId: this.test.reports,
                element: item,
              });
            }
          });
      }
      this.sendInvitationMail(guest);
    },
    reinvite(guest) {
      const UIDGenerator = require("uid-generator");
      const uidgen = new UIDGenerator();
      let invID = uidgen.generateSync();
      let inv = {
        id: invID,
        to: {
          id: guest.id,
          email: guest.email,
          accessLevel: guest.accessLevel.value,
        },
        from: {
          id: this.user.uid,
          email: this.user.email,
        },
        test: {
          id: this.test.id,
          title: this.test.title,
          type: this.test.type,
          reports: this.test.reports,
          answers: this.test.answers,
          cooperators: this.test.cooperators,
        },
      };
      this.$store
        .dispatch("pushNotification", {
          docId: inv.to.id,
          element: inv,
          param: "notifications",
        })
        .then(() => {
          this.$store
            .dispatch("updateCooperator", {
              docId: this.id,
              elementId: guest.id,
              element: null,
              param: "accepted",
            })
            .then(() => {
              guest.accepted = null;
            });
        });
    },
    pushToArray() {
      const UIDGenerator = require("uid-generator");
      const uidgen = new UIDGenerator();
      let token = uidgen.generateSync();
      let hasObj = false;
      let obj = null;

      if (typeof this.email == "object") {
        obj = Object.assign(
          {},
          {
            id: this.email.id,
            email: this.email.email,
            invited: false,
            accepted: null,
            accessLevel: { text: "Researcher", value: 1 },
            token: token,
          }
        );
      } else if (!this.email.includes("@") || !this.email.includes("."))
        alert(this.email + " is not a valid email");
      else {
        obj = Object.assign(
          {},
          {
            id: null,
            email: this.email,
            invited: false,
            accepted: null,
            accessLevel: { text: "Researcher", value: 1 },
            token: token,
          }
        );
      }

      if (obj !== null)
        this.cooperatorsEdit.forEach((coop) => {
          if (coop.email === obj.email) {
            hasObj = true;
          }
        });

      if (!hasObj && obj !== null) {
        this.cooperatorsEdit.push(obj);
        this.change = true;

        if (this.deletedCoops.includes(obj.id))
          //se add de novo remove do deleted
          this.deletedCoops.splice(this.deletedCoops.indexOf(obj.id), 1);

        this.userSelected = {};
        this.email = "";
        this.$refs.combobox.blur();
      }
    },
    removeCoop(coop) {
      this.deletedCoops.push(coop);
      this.change = true;
    },
    removeFromList(coop) {
      let index = this.cooperatorsEdit.indexOf(coop);
      this.cooperatorsEdit.splice(index, 1);
    },
    recordChange(item) {
      let edit = this.editedCoops.find((c) => c.guest.id == item.id);
      this.change = true;

      if (item.id) {
        if (!edit && item.accepted) {
          this.editedCoops.push({
            guest: item,
            previous: item.accessLevel,
            current: this.edited,
          });
        } else if (edit && item.accepted) {
          if (edit.previous.value === this.edited.value) {
            this.editedCoops.splice(this.editedCoops.indexOf(edit), 1);
          } else edit.current = this.edited;
        }
        let coop = this.cooperatorsEdit.find((coop) => coop.id == item.id);
        coop.accessLevel = this.edited;
      } else {
        let coop = this.cooperatorsEdit.find(
          (coop) => coop.token == item.token
        );
        coop.accessLevel = this.edited;
      }
    },
    preventNav(event) {
      if (!this.change) return;
      event.preventDefault();
      event.returnValue = "";
    },
    sendInvitationMail(guest) {
      let domain = window.location.href;
      domain = domain.replace(window.location.pathname, "");

      let email = Object.assign(
        {},
        {
          testId: this.test.id,
          from: this.user.email,
          testTitle: this.test.title,
          guest: guest,
          domain: domain,
        }
      );

      if (guest.accessLevel.value >= 2) {
        email = Object.assign(email, {
          path: "testview",
          token: guest.token,
        });
      } else {
        email = Object.assign(email, {
          path: "managerview",
          token: guest.token,
        });
      }
      this.$store.dispatch("sendEmailInvitation", email).then(() => {
        this.$set(guest, "invited", true);

        Object.assign(guest);
        this.$store.dispatch("pushCooperator", {
          docId: this.id,
          element: Object.assign({}, guest),
        });
      });
    },
    cancelInvitation(guest) {
      this.$store
        .dispatch("removeCooperator", {
          docId: this.id,
          element: {
            id: guest.id,
          },
        })
        .then(() => {
          if (guest.id) {
            this.$store.dispatch("removeNotification", {
              docId: guest.id,
              element: { id: guest.invitation },
            });
          }
          if (guest.accessLevel.value >= 2 && guest.id) {
            this.$store.dispatch("removeReport", {
              docId: this.testID.reports,
              element: {
                id: guest.id,
              },
              param: "reports",
            });
          }
        });
      this.cooperatorsEdit.splice(this.cooperatorsEdit.indexOf(guest), 1);
    },
  },
  watch: {
    cooperators: async function () {
      if (this.cooperators !== null && this.cooperators !== undefined) {
        this.cooperatorsEdit = Array.from(this.cooperators.cooperators);
        if (!this.$store.test) {
          this.$store.dispatch("getTest", { id: this.cooperators.test.id });
        }
      }

      if (Object.keys(this.cooperators).length) {
        this.loading = false;
      }
    },
    loading() {
      if (!this.loading) {
        if (this.cooperatorsEdit.length == 0) this.intro = true;
        else this.intro = false;
      }
    },
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    testID() {
      return this.$store.state.auth.user.myTests.find((test) =>
        Object.values(test).includes(this.id)
      );
    },
    user() {
      return this.$store.getters.user;
    },
    cooperators() {
      return this.$store.state.cooperators.cooperators || [];
    },
    users() {
      if (this.$store.state.users.users) return this.$store.getters.admins;
      return [];
    },
    filteredUsers() {
      let hasUser = null;
      let array = [];
      this.users.forEach((user) => {
        hasUser = false;
        this.cooperatorsEdit.forEach((coop) => {
          if (coop.id === user.id) {
            hasUser = true;
          }
        });
        if (!hasUser) array.push(user);
      });
      return array;
    },
  },
  created() {
    if (!this.$store.state.cooperators.cooperators)
      this.$store.dispatch("getCooperators", { id: this.id });
    else if (this.$store.state.cooperators.cooperators !== this.id)
      this.$store.dispatch("getCooperators", { id: this.id });
    else {
      this.cooperatorsEdit = Array.from(this.cooperators.cooperators);
      this.loading = false;
    }
    if (!this.$store.state.users.users) this.$store.dispatch("getUsers", {});
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
