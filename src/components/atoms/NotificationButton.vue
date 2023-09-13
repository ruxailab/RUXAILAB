<template>
  <div v-if="user.notifications">
    <v-menu :position-x="x" :position-y="y" absolute offset-y min-width="200">
      <template v-slot:activator="{ on, attrs }">
        <v-badge
          color="red"
          bottom
          overlap
          :content="checkIfHasNewNotifications()"
          :value="checkIfHasNewNotifications()"
        >
          <v-btn
            v-if="checkIfHasNewNotifications() === 0"
            small
            icon
            class="mr-1"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon size="20">mdi-bell-outline</v-icon>
          </v-btn>

          <v-btn v-else small icon v-bind="attrs" v-on="on" class="mr-1">
            <v-icon size="20">mdi-bell-ring</v-icon>
          </v-btn>
        </v-badge>
      </template>
      <div
        v-if="user.notifications.length > 0"
        style="max-height: 50vh;overflow-y: scroll;"
      >
        <v-list
          v-for="(notification, i) in user.notifications"
          :key="i"
          dense
          class="ma-0 py-1"
          style="border-radius: 0px !important;"
        >
          <v-list-item
            dense
            style="font-size: 14px; font: Roboto"
            class="px-2"
            @click="goToNotificationRedirect(notification)"
            :disabled="notification.read"
          >
            <v-list-item-content>
              <v-list-item-title style="font-weight: bold">{{
                notification.title
              }}</v-list-item-title>
              <v-list-item-subtitle>{{
                notification.description
              }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-icon v-if="!notification.read">
              <v-chip x-small color="success" outlined label>NEW!</v-chip>
            </v-list-item-icon>
          </v-list-item>

          <div class="divider"></div>
        </v-list>
      </div>
      <!-- <v-list v-if="user.notifications.length > 0" class="menu-scroll" two-line>
        <v-list-item
          v-for="(notification, n) in user.notifications"
          :key="n"
          style="cursor: default"
        >
          <v-row justify="center" class="mb-2">
            <v-col cols="12">
              <v-list-item-title
                v-if="notification.to.accessLevel != 2"
                class="text-wrap text-center"
                >{{ notification.from.email }} has invited you to colaborate on
                his test: "{{ notification.test.title }}"</v-list-item-title
              >
              <v-list-item-title v-else class="text-wrap text-center"
                >{{ notification.from.email }} has invited you to reply test:
                "{{ notification.test.title }}"</v-list-item-title
              >
            </v-col>

            <v-btn
              small
              color="success"
              @click="acceptNotification(notification)"
              >Accept</v-btn
            >
            <v-btn
              small
              class="ml-2"
              color="error"
              @click="
                removeNotification(notification), denyNotification(notification)
              "
              >Deny</v-btn
            >
          </v-row>
        </v-list-item>
      </v-list> -->

      <v-list v-else>
        <v-list-item>
          <v-list-item-title class="caption"
            >You don't have any notifications yet</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  data: () => ({
    x: 0,
    y: 50,
  }),
  methods: {
    async goToNotificationRedirect(notification) {
      // Mark notification as read
      await this.$store.dispatch('markNotificationAsRead', {
        notification: notification,
        user: this.user,
      })
      // Redirect to notification url
      this.$router.push(notification.redirectsTo)
    },
    checkIfHasNewNotifications() {
      const newNot = this.user.notifications.filter((n) => n.read === false)
      return newNot.length ?? 0
    },
  },
  computed: {
    user() {
      return this.$store.getters.user
    },
    test() {
      return this.$store.getters.test
    },
  },
}
</script>

<style scoped>
.divider {
  background: #c4c4c4 !important;
  height: 1.5px;
}
</style>
