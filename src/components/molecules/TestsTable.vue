<template>
  <div>
    <v-text-field
      @click.stop
      class="mx-3 pt-5"
      append-icon="mdi-magnify"
      label="Search"
      v-model="search"
    ></v-text-field>
    <v-data-table
      :headers="headers"
      :items="tests"
      @click:row="setTest"
      :items-per-page="5"
      :loading="loading"
      :search="search"
    >
      <template v-slot:item.type="{ item }">
        <!-- item type -->
        <td @click.stop style="cursor: default">
          <v-btn v-if="item.type" rounded small elevation="1">
            <span style="font-size: 7pt">{{ item.type }}</span>
          </v-btn>
        </td>
      </template>

      <template v-slot:item.edit="{ item }">
        <!-- edit button -->
        <td @click.stop style="cursor: default">
          <v-btn icon @click="editItem(item)" small :disabled="item.accessLevel <= 1 || item.accessLevel == null ? false : true">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </td>
      </template>

      <template v-slot:item.delete="{ item }">
        <!-- delete button -->
        <td @click.stop style="cursor: default">
          <v-btn icon @click="deleteTest(item)" small :disabled="item.accessLevel == 0 || item.accessLevel == null ? false : true">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </td>
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
              accessLevel: coop.accessLevel
            }
          });
        });
      });
      this.$store.dispatch("getTests", { doc: this.$route.params.tests })
    },
    editItem(test) {
      this.$router.push("/edittest/" + test.id);
    },
    setTest(item) {
      this.$emit("setTest", item);
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