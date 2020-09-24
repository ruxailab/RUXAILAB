<template>
  <div>
    <v-card class="mx-auto" height="500px" tile>
      <v-row justify="center" align="center">
        <v-col cols="11">
          <v-menu offset-y>
            <template class="red" v-slot:activator="{ on }">
              <v-text-field
                v-on="on"
                outlined
                dense
                label="Email"
                clearable
                prepend-inner-icon="mdi-magnify"
                v-model="seach"
              ></v-text-field>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, index) in seaching"
                :key="index"
                @click="select(item)"
              >
                <v-list-item-title>{{ item.email }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-row>
        <v-col>
          <v-list>
            <v-list-item-group>
              <v-list-item v-for="(item, i) in invitations" :key="i">
                <v-row align="center" justify="space-around">
                  <v-col cols="2">
                    <v-list-item-icon>
                      <v-icon>mdi-account-circle</v-icon>
                    </v-list-item-icon>
                  </v-col>
                  <v-col cols="4">
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="item.email"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-col>
                  <v-col cols="4">
                    <v-list-item-content v-if="type !== 'tester'">
                      <v-overflow-btn
                        v-model="accessLevel[i]"
                        class="my-2"
                        :items="accessLevels"
                        :label="
                          item.accessLevel !== null
                            ? item.accessLevel.toString()
                            : accessLevels[accessLevels.length - 1].toString()
                        "
                      ></v-overflow-btn>
                    </v-list-item-content>
                  </v-col>
                  <v-col cols="1">
                    <v-list-item-icon @click="deselect(item)">
                      <v-icon>mdi-close</v-icon>
                    </v-list-item-icon>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    invitations: {
      type: Array,
      required: true,
      default: function() {
        return [];
      }
    },
    type: {}
  },
  data: () => ({
    selecteds: [],
    seach: "",
    invitation: {
      id: null,
      email: null,
      accessLevel: null
    },
    accessLevels: [0, 1, 2],
    accessLevel: []
  }),
  methods: {
    select(item) {
      this.seach = "";
      this.invitation.id = item.id;
      this.invitation.email = item.email;
      this.invitation.accessLevel = this.accessLevels[
        this.accessLevels.length - 1
      ];
      this.invitations.push(this.invitation);
      this.invitation = {
        id: null,
        email: null,
        accessLevel: null
      };
    },
    deselect(item) {
      this.invitations.splice(this.invitations.indexOf(item), 1);
    }
  },
  computed: {
    users() {
      if (this.$store.state.users.users) return this.$store.getters.admins;
      return [];
    },
    seaching() {
      if (this.seach == null || this.seach == "") return this.users;
      else
        return this.users.filter(item => {
          return item.email.toLowerCase().includes(this.seach.toLowerCase());
        });
    }
  },
  watch: {
    accessLevel() {
      this.accessLevel.forEach(item => {
        this.invitations[this.accessLevel.indexOf(item)].accessLevel = item;
      });
    }
  },
  created() {
    if (!this.$store.state.users.users) this.$store.dispatch("getUsers", {});
  }
};
</script>

<style>
</style>