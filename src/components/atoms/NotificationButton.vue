<template>
  <div>
    <v-badge
      color="red"
      bottom
      overlap
      :content="user.notifications.length"
      :value="user.notifications.length"
    >
      <v-btn v-if="user.notifications.length == 0" small icon @click="openDropdown" class="mr-1">
        <v-icon small>mdi-bell-outline</v-icon>
      </v-btn>

      <v-btn v-else small icon @click="openDropdown" class="mr-1">
        <v-icon small>mdi-bell-ring</v-icon>
      </v-btn>
    </v-badge>

    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute max-width="300px" offset-y>
      <!-- colocar titulozinho -->
      <v-list v-if="user.notifications.length > 0">
        <v-list-item
          @click="nothing()"
          v-for="(notification, n) in user.notifications"
          :key="n"
          style="cursor: default"
        >
          <v-row justify="center" class="mb-2">
            <v-col cols="12">
              <v-list-item-title
              v-if="notification.to.accessLevel != 2"
                class="text-wrap text-center"
              >{{notification.from.email}} has invited you to colaborate on his test: "{{notification.test.title}}"</v-list-item-title>
               <v-list-item-title
                v-else
                class="text-wrap text-center"
              >{{notification.from.email}} has invited you to reply test: "{{notification.test.title}}"</v-list-item-title>
            </v-col>

            <v-btn small color="success" @click="joinTest(notification)">Accept</v-btn>
            <v-btn small class="ml-2" color="error" @click="removeNotification(notification)">Deny</v-btn>
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
    joinTest(item) {
      this.$store.dispatch("removeNotification", {
        docId: this.user.uid,
        element: item
      });
      this.$store.dispatch("pushMyCoops", {
        docId: this.user.uid,
        element: Object.assign(item.test, { accessLevel: item.to.accessLevel })
      });
      this.$store.dispatch("pushCoop", {
        docId: item.test.id,
        element: item.to
      });
    },
    removeNotification(notif) {
      this.$store.dispatch("removeNotification", {
        docId: this.user.uid,
        element: notif
      });
    },
    nothing() {} //this function is here for menu styling only
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    }
  }
};
</script>