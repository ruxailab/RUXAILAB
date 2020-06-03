<template>
  <div>
    <v-text-field
      class="mx-3 pt-5"
      append-icon="mdi-magnify"
      label="Search"
      v-model="search"
    ></v-text-field>
    <v-data-table
      :headers="headers"
      :items="tests"
      :items-per-page="5"
      :loading="loading"
      :search="search"
    >
      <template v-slot:item.type="{ item }">
        <!-- item type -->
        <v-btn v-if="item.type" rounded small elevation="1" style="cursor: default" :ripple="false">
          <span style="font-size: 7pt">{{ item.type }}</span>
        </v-btn>
      </template>

      <template v-slot:item.edit="{ item }">
        <!-- edit button -->
        <v-btn
          icon
          @click="editItem(item)"
          small
          :disabled="item.accessLevel <= 1 || item.accessLevel == null ? false : true"
        >
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.delete="{ item }">
        <!-- delete button -->
        <v-btn
          icon
          @click="deleteTest(item)"
          small
          :disabled="item.accessLevel == 0 || item.accessLevel == null ? false : true"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.more="{ item }">
        <!-- more button -->
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn icon small>
              <v-icon small v-on="on">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="openTest(item)">
              <v-list-item-title>Open Test</v-list-item-title>
            </v-list-item>

            <v-list-item @click="openAnswer(item)">
              <v-list-item-title>Open Answers</v-list-item-title>
            </v-list-item>

            <v-list-item @click="openManager(item)">
              <v-list-item-title>Open Manager</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: ["tests", "headers"],
  data: () => ({
    search: ""
  }),
  methods: {
    async deleteTest(item) {
      await this.$store.dispatch("getTest", { id: item.id });
      this.$store.dispatch("deleteTest", item).then(() => {
        //Remove test from myTests
        this.$store.dispatch("removeMyTest", {
          docId: this.test.admin.id,
          element: {
            id: item.id,
            title: item.title,
            type: item.type,
            reports: item.reports,
            accessLevel: 0
          },
          param: "myTests"
        });
        //Remove test from myCoops
        this.test.coop.forEach(coop => {
          this.$store.dispatch("removeMyCoops", {
            docId: coop.id,
            element: {
              id: item.id,
              title: item.title,
              type: item.type,
              reports: item.reports,
              accessLevel: coop.accessLevel
            }
          });
        });
          
        //Remove report from collection
        this.$store.dispatch('deleteReport', { id: item.reports });
      });
      this.$store.dispatch("getTests", { doc: this.$route.params.tests });
    },
    editItem(test) {
      this.$router.push("/edittest/" + test.id);
    },
    setTest(item) {
      this.$emit("setTest", item);
    },
    openTest(test) {
      if (!this.deleting && !this.editing)
        this.$router.push("/testview/" + test.id);
    },
    openAnswer(test) {
      this.$router.push("/answerview/" + test.id);
    },
    openManager(test){
      //alert("open manager for " + test.title);
      this.$router.push("/managerview/" + test.id);
    }
  },
  computed: {
    loading() {
      return this.$store.state.tests.loading;
    },
    user() {
      return this.$store.getters.user;
    },
    test() {
      if (this.$store.getters.test) return this.$store.getters.test;
      return [];
    }
  }
};
</script>