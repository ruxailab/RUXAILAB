<template>
  <v-container v-if="cooperators" class="ma-0 pa-0">
    <Snackbar />
     <Dialog :dialog="dialog" text="Are you sure you want to leave? All your changes will be discarded">
      <v-card-title
        slot="title"
        class="headline error accent-4 white--text"
        primary-title
      >Are you sure you want to leave?</v-card-title>

      <div slot="actions">
        <v-btn class="grey lighten-3" text @click="dialog = false">Stay</v-btn>
        <v-btn
          class="error accent-4 white--text ml-1"
          text
          @click="change = false,$router.push(go)"
        >Leave</v-btn>
      </div>
    </Dialog>
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
        <v-autocomplete
          style="background: #f5f7ff;"
          v-model="userSelected"
          :items="filteredUsers"
          item-text="email"
          return-object
          label="Add cooperator"
          @input="pushToArray()"
          dense
          color="#fca326"
          prepend-icon="mdi-account-multiple-plus"
          class="mx-4 pt-4"
        ></v-autocomplete>
        <v-data-table
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
              @change="recordChange(item)"
              v-model="item.accessLevel"
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
            <v-icon color="#F9A826" v-if="item.accepted == null">mdi-checkbox-blank-circle-outline</v-icon>
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

                <v-list-item @click="removeCoop(item),removeFromList(item)" v-if="item.accepted != null">
                  <v-list-item-title>Remove cooperator</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="item.invited && item.accepted == null">
                  <v-list-item-title>No options yet</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </div>
    </ShowInfo>
  </v-container>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";
import Snackbar from "@/components/atoms/Snackbar";
import Dialog from "@/components/atoms/Dialog";

export default {
  props: ["id"],
  components: {
    ShowInfo,
    Snackbar,
    Dialog
  },
  data: () => ({
    object: null,
    change: false,
    valids: [false, true, true],
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
      { text: "Tester", value: 2 },
      { text: "Guest", value: 1 },
      { text: "Administrator", value: 0 },
    ],
    dialog:false
  }),
  methods: {
    log() {
      console.log("aaaaaa");
    },
    validate(valid, index) {
      this.valids[index] = valid;
    },
    submit() {
      this.cooperatorsEdit.forEach(async (guest) => {
        //Invide new cooperators
        if (!guest.invited) {
          this.send(guest);
        }

        if (this.editedCoops.includes(guest.id)) {
          this.edit(guest);
        }

        this.deletedCoops.forEach((guest) => {
          this.remove(guest);
        });
      });
    },
    remove(guest) {
      console.log(guest)
      if(guest.accessLevel.value != 2){
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
              })
      }else{
        this.$store.dispatch("removeMyAnswers",{
           docId: guest.id,
            element: {
              id: this.testID.id,
            }
        }).then(()=>{
   this.$store.dispatch("removeReport", {
        docId: this.testID.reports,
        element: {
          id: guest.id,
        },
        param: "reports",
      }).then(()=>{
         this.$store.dispatch("removeCooperator", {
            docId: this.id,
            element: {
              id: guest.id,
            },
          });
      })

        })
     
      }
    },
    edit(guest) {
      this.$store
        .dispatch("updateAccessLevel", {
          docId: guest.id,
          elementId: this.id,
          element: guest.accessLevel.value,
          param: "accessLevel",
        })
        .then(() => {
          this.$store.dispatch("updateCooperator", {
            docId: this.id,
            elementId: guest.id,
            element: guest.accessLevel,
            param: "accessLevel",
          });
        });
    },
    send(guest) {
      let inv = {
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
          guest.invited = true;
          //Access Level Guest
            this.$store.dispatch("pushCooperator", {
              docId: this.id,
              element: Object.assign({}, guest),
            });
          //Access Level Tester
          if(guest.accessLevel.value == 2){
            let item = Object.assign({},{
              uid: guest.id,
              email:guest.email,
              log:{
                  date: new Date().toLocaleString("en-Us"),
                  progress: 0,
                  status: "Invited"
              }
            })
            console.log(item)
            this.$store.dispatch("pushLog", {
              docId: this.test.reports,
              element: item,
            });
          }

        });
    },
    reinvite(guest) {
      let inv = {
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
      let hasObj = false;
      let obj = {
        id: this.userSelected.id,
        email: this.userSelected.email,
        invited: false,
        accepted: null,
        accessLevel: { text: "Researcher", value: 1 },
      };
      let index = 0;

      this.cooperatorsEdit.forEach((coop) => {
        if (coop.id === obj.id) {
          hasObj = true;
          this.filteredUsers.splice(index, 1);
          index++;
        }
      });

      if (!hasObj) {
        this.cooperatorsEdit.push(obj);
        this.change = true;

        if (this.deletedCoops.includes(obj.id))
          //se add de novo remove do deleted
          this.deletedCoops.splice(this.deletedCoops.indexOf(obj.id), 1);
      }
      this.userSelected = {};
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
      this.change = true;
      if (!this.editedCoops.includes(item.id) && item.accepted)
        this.editedCoops.push(item.id);

      console.log(this.editedCoops);
    },
     preventNav(event) {
      if (!this.change) return;
      event.preventDefault();
      event.returnValue = "";
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
    },
    
  },
  computed: {
    test() {
      return this.$store.getters.test;
    },
    testID() {
      return this.$store.state.auth.user.myTests.find((test) =>
        Object.values(test).includes(this.id)
      )
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
