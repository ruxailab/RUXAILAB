<template>
  <div>
    <v-overlay class="text-center" v-model="loading" v-if="loading">
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      ></v-progress-circular>
      <div class="white-text mt-3">Loading Cooperators</div>
    </v-overlay>
    <Intro
      v-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops"
      @closeIntro="intro = false"
    />

    <v-row justify="center">
      <v-container class="ma-0 pa-0">
        <Snackbar />
        <!-- Leave alert dialog -->
        <v-dialog v-model="dialog" width="600" persistent>
          <LeaveAlert />
        </v-dialog>

        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              large
              dark
              fab
              fixed
              bottom
              right
              color="#F9A826"
              @click="saveInvitations()"
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
                  :items="users"
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
                    >There are no users registered with that email, press enter
                    to select anyways.</template
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
                      @click="reinvite(item)"
                      link
                      v-if="item.accepted == false"
                    >
                      <v-list-item-title>Re-invite</v-list-item-title>
                    </v-list-item>

                    <v-list-item @click="removeCoop(item)" v-if="item.accepted">
                      <v-list-item-title>Remove cooperator</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      @click="cancelInvitation(item)"
                      v-if="item.invited && !item.accepted"
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
    <AccessNotAllowed v-if="!loading && verified" />
  </div>
</template>

<script>
import ShowInfo from "@/components/organisms/ShowInfo.vue";
import Snackbar from "@/components/atoms/Snackbar";
import Intro from "@/components/molecules/IntroCoops";
import AccessNotAllowed from "@/components/atoms/AccessNotAllowed";
import LeaveAlert from "../../components/atoms/LeaveAlert.vue";
import { cooperatorsHeaders } from "@/utils/headers";
import { roleOptionsItems } from "@/utils/items";
import Notification from "@/models/Notification";

const UIDGenerator = require("uid-generator");

export default {
  props: ["id"],
  components: {
    ShowInfo,
    Snackbar,
    Intro,
    AccessNotAllowed,
    LeaveAlert,
  },
  data: () => ({
    object: null,
    headers: cooperatorsHeaders,
    roleOptions: roleOptionsItems,
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
    async changeRole(item, event) {
      let index = this.cooperatorsEdit.indexOf(item);
      let newCoop = Object.assign({}, item);
      newCoop.accessLevel = event.value;

      const currentAccessLevelText = this.roleOptions.find(
        (r) => r.value === item.accessLevel
      ).text;

      if (item.accessLevel !== event.value) {
        let ok = confirm(
          `Are you sure you want to change ${item.email}'s role from "${currentAccessLevelText}" to "${event.text}"`
        );
        if (ok) {
          // UPDATE TEST WITH NEW COLLABORATOR ROLE
          this.test.cooperators[index] = newCoop;
          await this.$store.dispatch("updateTest", this.test);

          // UPDATE COOPERATOR ARRAY 'MYANSWERS' TO HAVE NEW ACCESSROLE
          await this.$store.dispatch("updateUserAnswer", {
            testDocId: this.test.id,
            cooperatorId: newCoop.userDocId,
            data: { accessLevel: newCoop.accessLevel },
          });
        } else {
          this.dataTableKey++; //forces data table re-render without changing user role
        }
      }
    },
    async submit() {
      this.test.cooperators = [...this.cooperatorsEdit];
      await this.$store.dispatch("updateTest", this.test);

      // Notify users
      this.cooperatorsEdit.forEach((guest) => {
        if (!guest.accepted) {
          this.notifyCooperator(guest);
        }
      });

      this.selectedCoops = [];
      this.$refs.combobox.blur();
    },
    notifyCooperator(guest) {
      // Notify user on the platform in case it is already registered
      if (guest.userDocId) {
        let path = "";
        if (guest.accessLevel.value >= 2) {
          path = "testview";
        } else {
          path = "managerview";
        }
        this.$store.dispatch("addNotification", {
          userId: guest.userDocId,
          notification: new Notification({
            title: `Cooperation Invite!`,
            description: `You have been invited to test ${this.test.testTitle}!`,
            redirectsTo: `${path}/${this.test.id}/${guest.token}`,
            read: false,
          }),
        });
      }
      this.sendInvitationMail(guest);
    },
    reinvite(guest) {
      this.notifyCooperator(guest);
    },
    saveInvitations() {
      const uidgen = new UIDGenerator();
      let token = uidgen.generateSync();

      this.selectedCoops.forEach((coop) => {
        // If it is not a user that exists on the platform
        if (!coop.id) {
          this.cooperatorsEdit.push({
            userDocId: null,
            email: coop,
            invited: true,
            accepted: false,
            accessLevel: this.roleOptions[this.selectedRole].value,
            token: token,
            progress: 0,
            answerStatus: "",
            updateDate: this.test.updateDate,
            testAuthorEmail: this.test.testAdmin.email,
          });
        } else {
          this.cooperatorsEdit.push({
            userDocId: coop.id,
            email: coop.email,
            invited: true,
            accepted: false,
            accessLevel: this.roleOptions[this.selectedRole].value,
            token: token,
            progress: 0,
            answerStatus: "",
            updateDate: this.test.updateDate,
            testAuthorEmail: this.test.testAdmin.email,
          });
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
          }
        }
      } else if (!this.selectedCoops.includes(this.email)) {
        this.selectedCoops.push(this.email);
      }
    },
    async removeCoop(coop) {
      let ok = confirm(
        `Are you sure you want to remove ${coop.email} from your cooperators?`
      );
      if (ok) {
        // Remove from test
        let index = this.cooperatorsEdit.indexOf(coop);
        this.cooperatorsEdit.splice(index, 1);
        this.test.cooperators = this.cooperatorsEdit;
        this.test.numberColaborators = this.test.numberColaborators - 1;

        await this.$store.dispatch("updateTest", this.test);

        // Remove from cooperator
        await this.$store.dispatch("removeTestFromCooperator", {
          test: this.test,
          cooperator: coop,
        });
      }
    },
    removeFromList(coop) {
      let index = this.cooperatorsEdit.indexOf(coop);
      this.cooperatorsEdit.splice(index, 1);
    },
    async sendInvitationMail(guest) {
      let domain = window.location.href;
      domain = domain.replace(window.location.pathname, "");

      let email = {
        testId: this.test.id,
        from: this.user.email,
        testTitle: this.test.testTitle,
        guest: guest,
        domain: domain,
      };

      if (guest.accessLevel === 1) {
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
      await this.$store.dispatch("sendEmailInvitation", email);
    },
    async cancelInvitation(guest) {
      let ok = confirm(
        `Are you sure you want to cancel ${guest.email} from your cooperators?`
      );
      if (ok) {
        let index = this.cooperatorsEdit.indexOf(guest);
        this.cooperatorsEdit.splice(index, 1);
        this.test.cooperators = this.cooperatorsEdit;

        await this.$store.dispatch("updateTest", this.test);
      }
    },
  },
  watch: {
    loading() {
      if (!this.loading) {
        if (this.cooperatorsEdit.length == 0) this.intro = true;
        else this.intro = false;
      }
    },
  },
  computed: {
    dialog() {
      return this.$store.state.dialog;
    },
    test() {
      return this.$store.getters.test;
    },
    user() {
      return this.$store.getters.user;
    },
    users() {
      return this.$store.state.Users.users;
    },
    cooperatorsEdit() {
      if (this.test.cooperators) return [...this.test.cooperators];
      return [];
    },
    loading() {
      return this.$store.getters.loading;
    },
  },
  created() {
    this.$store.dispatch("getAllUsers");
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
