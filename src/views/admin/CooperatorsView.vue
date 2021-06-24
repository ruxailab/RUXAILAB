<template>
  <v-overlay class="text-center" v-model="loading" v-if="loading">
    <v-progress-circular
      indeterminate
      color="#fca326"
      size="50"
    ></v-progress-circular>
    <div class="white-text mt-3">Loading Cooperators</div>
  </v-overlay>
  <Intro
    v-else-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops"
    @closeIntro="intro = false"
  />
  <v-row justify="center" v-else-if="cooperators && showCoops">
    <v-container class="ma-0 pa-0">
      <Snackbar />

      <!-- Leave alert dialog -->
      <v-dialog v-model="dialog" width="600" persistent>
        <v-card>
          <v-card-title
            class="headline error accent-4 white--text"
            primary-title
            >Are you sure you want to leave?</v-card-title
          >

          <v-card-text
            >Are you sure you want to leave? All your changes will be
            discarded</v-card-text
          >

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
            @click="pushToArray(), (change = false)"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon large>mdi-email</v-icon>
          </v-btn>
        </template>
        <span>Send invitations</span>
      </v-tooltip>

      <ShowInfo title="Cooperators">
        <div class="ma-0 pa-0" style="background: #f5f7ff" slot="content">
          <v-chip
            class="ml-2 mt-2"
            v-for="(coop, i) in selectedCoops"
            :key="i"
            @click:close="removeSelectedCoops(i)"
            close
            >{{ typeof coop == "object" ? coop.email : coop }}</v-chip
          >
          <v-row class="ma-0 pa-0 pt-3" align="center">
            <v-col class="ma-0 pa-0" cols="12" md="10">
              <v-combobox
                :hide-no-data="false"
                :autofocus="comboboxKey == 0 ? false : true"
                style="background: #f5f7ff"
                :items="filteredUsers"
                item-text="email"
                label="Select cooperator"
                @input="validateEmail()"
                v-model="comboboxModel"
                multiple
                :key="comboboxKey"
                ref="combobox"
                outlined
                dense
                color="#fca326"
                class="mx-2"
              >
                <template v-slot:no-data
                  >There are no users registered with that email, press enter to
                  select anyways.</template
                >
              </v-combobox>
            </v-col>
            <v-col class="ma-0 pa-0" cols="12" md="2">
              <v-select
                v-model="selectedRole"
                class="mx-2"
                label="Role"
                color="#fca326"
                outlined
                dense
                :items="roleOptions"
              ></v-select>
            </v-col>
          </v-row>
          <v-data-table
            dense
            style="background: #f5f7ff"
            :items="cooperatorsEdit"
            :headers="headers"
            height="450px"
            :items-per-page="7"
            items-per-page-text="7"
            :footer-props="{
              'items-per-page-options': [7],
            }"
          >
            <!-- Email -->
            <template v-slot:item.email="{ item }">
              <v-row align="center">
                <v-icon class="mr-2">mdi-account-circle</v-icon>
                <div>{{ item.email }}</div>
              </v-row>
            </template>

            <!-- Role -->
            <template v-slot:item.accessLevel="{ item }">
              <v-select
                color="#fca326"
                style="max-width: 200px"
                @change="changeRole(item, $event)"
                :value="item.accessLevel"
                :ref="'select' + cooperatorsEdit.indexOf(item)"
                return-object
                dense
                :items="roleOptions"
                :v-text="item.accessLevel.text"
                :disabled="!item.invited || item.accepted ? false : true"
                class="mt-3"
                :key="dataTableKey"
              ></v-select>
            </template>

            <!-- Invited -->
            <template v-slot:item.invited="{ item }">
              <v-icon color="#8EB995" v-if="item.invited"
                >mdi-checkbox-marked-circle-outline</v-icon
              >
              <v-icon color="#F47C7C" v-else>mdi-close-circle-outline</v-icon>
            </template>

            <!-- Accepted -->
            <template v-slot:item.accepted="{ item }">
              <v-icon color="#F9A826" v-if="item.accepted == null"
                >mdi-checkbox-blank-circle-outline</v-icon
              >
              <v-icon color="#8EB995" v-else-if="item.accepted"
                >mdi-checkbox-marked-circle-outline</v-icon
              >
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
                  <v-list-item
                    @click="removeFromList(item)"
                    v-if="!item.invited"
                  >
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
                    @click="removeCoop(item)"
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
  <AccessNotAllowed v-else-if="!loading && verified" />
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";
import Snackbar from "@/components/atoms/Snackbar";
import Intro from "@/components/molecules/IntroCoops";
import AccessNotAllowed from "@/components/atoms/AccessNotAllowed";

export default {
  props: ["id"],
  components: {
    ShowInfo,
    Snackbar,
    Intro,
    AccessNotAllowed,
  },
  data: () => ({
    object: null,
    change: false,
    cooperatorsEdit: [],
    headers: [
      { text: "User", value: "email" },
      { text: "Role", value: "accessLevel" },
      { text: "Invited", value: "invited", justify: "center" },
      { text: "Accepted", value: "accepted", justify: "center" },
      { text: "More", value: "more", sortable: false },
    ],
    roleOptions: [
      { text: "Administrator", value: 0 },
      { text: "Guest", value: 1 },
      { text: "Evaluator", value: 2 },
    ],
    dialog: false,
    intro: null,
    email: "",
    selectedCoops: [],
    comboboxModel: [],
    comboboxKey: 0,
    selectedRole: 1,
    showCoops: false,
    verified: false,
    dataTableKey: 0,
  }),
  methods: {
    removeSelectedCoops(index) {
      this.selectedCoops.splice(index, 1);
    },
    changeRole(item, event) {
      let index = this.cooperatorsEdit.indexOf(item);
      let newCoop = Object.assign({}, item);
      newCoop.accessLevel = event;

      if (item.accessLevel.value !== event.value) {
        let ok = confirm(
          `Are you sure you want to change ${item.email}'s role from "${item.accessLevel.text}" to "${event.text}"`
        );
        if (ok) {
          let edited = Object.assign(
            {},
            {
              guest: item,
              previous: item.accessLevel,
              current: event,
            }
          );

          this.edit(edited);
          this.$set(this.cooperatorsEdit, index, newCoop); //update on table
        } else {
          this.dataTableKey++; //forces data table re-render without changing user role
        }
      }
    },
    submit() {
      this.cooperatorsEdit.forEach((guest) => {
        //Invite new cooperators
        if (!guest.invited) this.send(guest);
      });

      //update nCoops
      this.$store.dispatch("updateMyTest", {
        docId: this.test.admin.id,
        element: {
          accessLevel: 0,
          answers: this.test.answers,
          cooperators: this.test.cooperators,
          date: this.test.date,
          id: this.test.id,
          reports: this.test.reports,
          title: this.test.title,
          type: this.test.type,
          nCoops: this.cooperatorsEdit.length,
        },
      });

      this.change = false;
      this.selectedCoops = [];
      this.$refs.combobox.blur();
    },
    remove(guest) {
      if (guest.accessLevel.value != 2) {
        this.$store
          .dispatch("removeMyCoops", {
            docId: guest.id,
            element: {
              id: this.test.id,
            },
          })
          .then(() => {
            //Remove element array
            this.$store
              .dispatch("removeCooperator", {
                docId: this.id,
                element: {
                  id: guest.id,
                },
              })
              .then(() => {
                this.$store.commit(
                  "setSuccess",
                  "Cooperator successfuly removed"
                );
              })
              .catch((err) => {
                this.$store.commit("setError", err);
              });
          });
      } else {
        this.$store
          .dispatch("removeMyAnswers", {
            docId: guest.id,
            element: {
              id: this.test.id,
            },
          })
          .then(() => {
            this.$store
              .dispatch("removeReport", {
                docId: this.test.reports,
                element: {
                  id: guest.id,
                },
                param: "reports",
              })
              .then(() => {
                this.$store
                  .dispatch("removeCooperator", {
                    docId: this.id,
                    element: {
                      id: guest.id,
                    },
                  })
                  .then(() => {
                    this.$store.commit(
                      "setSuccess",
                      "Cooperator successfuly removed"
                    );
                  })
                  .catch((err) => {
                    this.$store.commit("setError", err);
                  });
              });
          });
      }

      //update nCoops
      this.$store.dispatch("updateMyTest", {
        docId: this.test.admin.id,
        element: {
          accessLevel: 0,
          answers: this.test.answers,
          cooperators: this.test.cooperators,
          date: this.test.date,
          id: this.test.id,
          reports: this.test.reports,
          title: this.test.title,
          type: this.test.type,
          nCoops: this.cooperatorsEdit.length,
        },
      });
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
                  id: this.test.id,
                },
              })
              .then(() => {
                this.$store.dispatch("removeReport", {
                  docId: this.test.reports,
                  element: {
                    id: guest.id,
                  },
                  param: "reports",
                });
                let test = Object.assign({}, this.test);
                this.$store
                  .dispatch("pushMyCoops", {
                    docId: guest.guest.id,
                    element: Object.assign(test, {
                      accessLevel: guest.current.value,
                    }),
                  })
                  .then(() =>
                    this.$store.commit("setSuccess", "Role successfuly updated")
                  )
                  .catch((err) => this.$store.commit("setError", err));
              });
          } else if (
            //It'll be a Tester
            (guest.previous.value == 1 || guest.previous.value == 0) &&
            guest.current.value == 2
          ) {
            this.$store
              .dispatch("removeMyCoops", {
                docId: guest.guest.id,
                element: {
                  id: this.test.id,
                },
              })
              .then(() => {
                let test = Object.assign({}, this.test);
                this.$store.dispatch("pushMyAnswers", {
                  docId: guest.guest.id,
                  element: Object.assign(test, {
                    answersSheet: Object.assign(this.test.answersSheet, {
                      submitted: false,
                    }),
                    accessLevel: {
                      text: "Evaluator",
                      value: 2,
                    },
                    author: this.test.admin.email,
                    date: new Date().toDateString(),
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
                  docId: this.test.reports,
                  element: item,
                });
              })
              .then(() =>
                this.$store.commit("setSuccess", "Role successfuly updated")
              )
              .catch((err) => this.$store.commit("setError", err));
          } else if (guest.previous.value != 2 && guest.current.value != 2) {
            this.$store
              .dispatch("updateAccessLevel", {
                docId: guest.guest.id,
                elementId: this.id,
                element: guest.current.value,
                param: "accessLevel",
              })
              .then(() =>
                this.$store.commit("setSuccess", "Role successfuly updated")
              )
              .catch((err) => this.$store.commit("setError", err));
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
            author: this.test.admin.email,
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
              this.$store
                .dispatch("pushLog", {
                  docId: this.test.reports,
                  element: item,
                })
                .then(() => {
                  this.$store.commit(
                    "setSuccess",
                    "Invitations sent successfully!"
                  );
                })
                .catch((err) => {
                  this.$store.commit("setError", err);
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

      this.selectedCoops.forEach((coop) => {
        if (typeof coop == "object") {
          obj = Object.assign(
            {},
            {
              id: coop.id,
              email: coop.email,
              invited: false,
              accepted: null,
              accessLevel: this.roleOptions[this.selectedRole],
              token: token,
            }
          );
        } else {
          obj = Object.assign(
            {},
            {
              id: null,
              email: coop,
              invited: false,
              accepted: null,
              accessLevel: this.roleOptions[this.selectedRole],
              token: token,
            }
          );
        }

        if (obj !== null)
          this.cooperatorsEdit.forEach((coopEdit) => {
            if (coopEdit.email === obj.email) {
              hasObj = true;
            }
          });

        if (!hasObj && obj !== null) {
          this.cooperatorsEdit.push(obj);
        }
      });

      this.submit();
    },
    validateEmail() {
      this.email = this.comboboxModel.pop();
      this.comboboxKey++;

      if (typeof this.email !== "object" && this.email !== undefined) {
        //if is object then no need to validate
        if (this.email.length) {
          if (!this.email.includes("@") || !this.email.includes(".")) {
            alert(this.email + " is not a valid email");
          } else if (!this.selectedCoops.includes(this.email)) {
            this.selectedCoops.push(this.email);
            this.change = true;
          }
        }
      } else if (!this.selectedCoops.includes(this.email)) {
        this.selectedCoops.push(this.email);
        this.change = true;
      }
    },
    removeCoop(coop) {
      // this.deletedCoops.push(coop);
      let ok = confirm(
        `Are you sure you want to remove ${coop.email} from your cooperators?`
      );
      if (ok) {
        let index = this.cooperatorsEdit.indexOf(coop);
        this.cooperatorsEdit.splice(index, 1);
        this.remove(coop);
      }
    },
    removeFromList(coop) {
      let index = this.cooperatorsEdit.indexOf(coop);
      this.cooperatorsEdit.splice(index, 1);
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
              docId: this.test.reports,
              element: {
                id: guest.id,
              },
              param: "reports",
            });
          }
        });
      this.cooperatorsEdit.splice(this.cooperatorsEdit.indexOf(guest), 1);

      //update nCoops
      this.$store.dispatch("updateMyTest", {
        docId: this.test.admin.id,
        element: {
          accessLevel: 0,
          answers: this.test.answers,
          cooperators: this.test.cooperators,
          date: this.test.date,
          id: this.test.id,
          reports: this.test.reports,
          title: this.test.title,
          type: this.test.type,
          nCoops: this.cooperatorsEdit.length,
        },
      });
    },
  },
  watch: {
    cooperators: async function () {
      if (this.cooperators !== null && this.cooperators !== undefined) {
        this.cooperatorsEdit = Array.from(this.cooperators.cooperators);
        if (!this.$store.test) {
          await this.$store.dispatch("getTest", {
            id: this.cooperators.test.id,
          });
        }

        let isOwner =
          this.user.myTests.find((test) => test.cooperators == this.id) ==
          undefined
            ? false
            : true;

        let hasAccess = false;
        if (!isOwner) {
          hasAccess =
            this.cooperators.cooperators.find(
              (coop) =>
                coop.email == this.user.email && coop.accessLevel.value == 0
            ) == undefined
              ? false
              : true;
        }

        // grant access if user is superadmin
        if(this.user?.accessLevel == 0) hasAccess = true;
        
        if (hasAccess || isOwner) this.showCoops = true;
        this.verified = true;
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
    user() {
      return this.$store.getters.user;
    },
    cooperators() {
      return this.$store.getters.cooperators || [];
    },
    users() {
      if (this.$store.getters.users) return this.$store.getters.admins;
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
    loading() {
      return this.$store.getters.loading;
    },
  },
  created() {
    if (!this.$store.getters.cooperators)
      this.$store.dispatch("getCooperators", { id: this.id });
    else if (this.$store.getters.cooperators !== this.id)
      this.$store.dispatch("getCooperators", { id: this.id });
    else {
      this.cooperatorsEdit = Array.from(this.cooperators.cooperators);
    }
    if (!this.$store.getters.users) this.$store.dispatch("getUsers", {});
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
