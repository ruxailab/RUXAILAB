<template>
  <div v-if="user.notifications">
    <v-badge
      color="red"
      bottom
      overlap
      :content="user.notifications.length"
      :value="user.notifications.length"
    >
      <v-btn v-if="user.notifications.length == 0" small icon @click="openDropdown" class="mr-1">
        <v-icon size="20">mdi-bell-outline</v-icon>
      </v-btn>

      <v-btn v-else small icon @click="openDropdown" class="mr-1">
        <v-icon size="20">mdi-bell-ring</v-icon>
      </v-btn>
    </v-badge>

    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute max-width="300px" offset-y>
      <v-list v-if="user.notifications.length > 0" class="menu-scroll">
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

            <v-btn small color="success" @click="acceptNotification(notification)">Accept</v-btn>
            <v-btn
              small
              class="ml-2"
              color="error"
              @click="removeNotification(notification),denyNotification(notification)"
            >Deny</v-btn>
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
    async acceptNotification(item) {
      this.$store.dispatch("removeNotification", {
        docId: this.user.uid,
        element: item
      });
      if (item.to.accessLevel < 2) {
        //joinTest
        this.$store.dispatch("pushMyCoops", {
          docId: this.user.uid,
          element: Object.assign(item.test, {
            accessLevel: item.to.accessLevel,
            date: new Date().toDateString()
          })
        });
      } else {
        //answer
        await this.$store.dispatch("getTest", { id: item.test.id });
        this.$store.dispatch("pushMyAnswers", {
          docId: this.user.uid,
          element: Object.assign(item.test, {
            answersSheet: Object.assign(this.test.answersSheet, {
              submitted: false
            }),
            accessLevel: {
              text: "Evaluator",
              value: 2
            },
            date: new Date().toDateString()
          })
        });

        //update log
        var log = {
          date: new Date().toLocaleString("en-US"),
          progress: 0,
          status: "In progress"
        };
        this.$store.dispatch("updateLog", {
          docId: item.test.reports,
          elementId: this.user.uid,
          element: log
        });
      }
      this.$store.dispatch("updateCooperator", {
        docId: item.test.cooperators,
        elementId: item.to.id,
        element: true,
        param: "accepted"
      });
    },
    denyNotification(item) {
      if (item.to.accessLevel >= 2) {
        var log = {
          date: new Date().toLocaleString("en-US"),
          progress: 0,
          status: "Denied"
        };
        this.$store.dispatch("updateLog", {
          docId: item.test.reports,
          elementId: this.user.uid,
          element: log
        });
      }
      this.$store.dispatch("updateCooperator", {
        docId: item.test.cooperators,
        elementId: item.to.id,
        element: false,
        param: "accepted"
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
      return this.$store.getters.user;
    },
    test() {
      return this.$store.getters.test;
    }
  }
};
</script>

<style scoped>
.menu-scroll {
  max-height: 400px;
  overflow: auto;
}
/* width */
.menu-scroll::-webkit-scrollbar {
  width: 9px;
}
/* Track */
.menu-scroll::-webkit-scrollbar-track {
  background: none;
}
/* Handle */
.menu-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}
/* Handle on hover */
.menu-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
</style>