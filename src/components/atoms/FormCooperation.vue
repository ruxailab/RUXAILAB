<template>
  <div>
    <v-card class="mx-auto" tile>
      <v-toolbar>
        <v-container>
          <v-text-field label="Email" outlined clearable append-icon="mdi-magnify"></v-text-field>
        </v-container>
      </v-toolbar>
      <v-list>
        <v-list-item-group color="primary">
          <v-list-item v-for="(item, i) in users" :key="i">
            <v-list-item-content>
              <v-list-item-title v-text="item"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({}),
  computed: {
    users() {
      return this.$store.state.users.users || [];
    }
  },
  created() {
    if (!this.$store.state.users.users) this.$store.dispatch("getUsers", {});
  }
};
</script>

<style>
</style>