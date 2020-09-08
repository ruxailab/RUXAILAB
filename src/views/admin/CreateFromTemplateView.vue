<template>
  <div>
    <v-row justify="center">
      <v-col cols="11">
        <v-row align="center" v-if="!searching">
          <span class="titleText ml-3 mb-2">Create from template</span>

          <v-text-field
            full-width
            dense
            class="ml-4 mt-6 hidden-sm-and-down"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            outlined
            color="grey darken-2"
            v-model="search"
          ></v-text-field>
          <v-spacer class="hidden-md-and-up"></v-spacer>
          <v-btn class="mr-3 hidden-md-and-up" icon @click="searching = true">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-row>
        <v-text-field
          :autofocus="searching"
          @blur="searching = false"
          v-else
          dense
          label="Search"
          prepend-inner-icon="mdi-magnify"
          outlined
          color="grey darken-2"
          v-model="search"
        ></v-text-field>
        <v-divider class="mb-1"></v-divider>

        <List @clicked="openTemp()" :tests="filteredTemplates"></List>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import List from "@/components/atoms/ListTests";
export default {
  components: {
    List,
  },
  data: () => ({
    templates: [
      { title: "Template 1", date: new Date().toDateString(), type: "Expert", author: 'John Green' },
      { title: "Template 2", date: new Date().toDateString(), type: "Expert", author: 'John Green' },
      { title: "Template 3", date: new Date().toDateString(), type: "Expert", author: 'John Green' },
    ],
    searching: false,
    search: "",
  }),
  methods: {
    openTemp() {
        alert('open template')
    },
  },
  computed: {
    filteredTemplates() {
      return this.templates.filter((temp) => {
        return temp.title.toLowerCase().includes(this.search.toLowerCase());
      });
    },
  },
};
</script>

<style scoped>
.titleText {
  font-size: 40px;
  font-weight: 300;
}
</style>