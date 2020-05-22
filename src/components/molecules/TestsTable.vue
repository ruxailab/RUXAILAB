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
      @click:row="emmit('setTest', item)"
      :items-per-page="5"
      show-expand
      :loading="loading"
      :search="search"
    >
      <template v-slot:expanded-item="{ headers, item }">
        <!-- expanded description -->
        <td :colspan="headers.length" class="pa-3">
          <h2 class="mb-1">{{ item.title }}</h2>
          <div class="caption" v-if="item.description">{{ item.description }}</div>
          <div class="caption" v-else>Test has no description</div>
        </td>
      </template>

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
          <v-btn icon @click="editItem(item)" small>
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </td>
      </template>

      <template v-slot:item.delete="{ item }">
        <!-- delete button -->
        <td @click.stop style="cursor: default">
          <v-btn icon @click="deleteTest(item)" small>
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
    deleteTest(item) {
      this.$store.dispatch("deleteTest", item);
      this.$store.dispatch("getTests", { doc: this.$route.params.tests });
    },
    openTest(test) {
      if (!this.deleting && !this.editing)
        this.$router.push("/testview/" + test.id);
    },
    editItem(test) {
      this.$router.push("/edittest/" + test.id);
    }
  },
  computed: {
    loading() {
      return this.$store.state.tests.loading;
    }
  }
};
</script>