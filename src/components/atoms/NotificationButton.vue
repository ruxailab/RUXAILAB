<template>
  <div>
    <v-btn v-if="user.notifications.length == 0" small icon @click="openDropdown">
      <v-icon small>mdi-bell</v-icon>
    </v-btn>

    <v-btn v-else small icon @click="openDropdown">
      <v-icon small>mdi-bell-ring</v-icon>
    </v-btn>

    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute max-width="300px" offset-y>
        <!-- colocar titulozinho -->
      <v-list v-if="user.notifications.length > 0">
        <v-list-item @click="nothing()" v-for="(notification, n) in user.notifications" :key="n" style="cursor: default">
          <v-row justify="center" class="mb-2">
            <v-col cols="12">
              <v-list-item-title
                class="text-wrap text-center"
              >{{notification}}</v-list-item-title>
            </v-col>

            <v-btn small color="success" @click="joinTest()">Accept</v-btn>
            <v-btn small class="ml-2" color="error" @click="removeNotif()">Deny</v-btn>
          </v-row>
        </v-list-item>
      </v-list>

      <v-list v-else>
        <v-list-item>
          <v-list-item-title class="caption">You don't have any notifications yet</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  data: () => ({
    showMenu: false,
    x: 0,
    y: 0
  }),
  methods: {
    openDropdown(e) {
      e.preventDefault();
      this.showMenu = false;
      this.x = e.clientX;
      this.y = e.clientY;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    joinTest() {
        console.log('Accept');
    },
    removeNotif() {
        console.log('Deny');
    },
    nothing() {}, //this function is here for menu styling only
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    }
  }
};
</script>