<template>
  <div>
    <v-hover v-slot:default="{ hover }">
      <v-card :elevation="hover ? 24 : 10" shaped class="card" @click="dialog = true">
        <v-card-text>
          <v-row class="fill-height" justify="center" align="center">
            <v-icon color="#f9a826" size="150">mdi-plus-circle-outline</v-icon>
          </v-row>
          <v-row class="fill-height" justify="center" align="center">
            <p>New Test</p>
          </v-row>
        </v-card-text>
      </v-card>
    </v-hover>
    <v-dialog v-model="dialog" max-width="80%">
      <v-card color="#e8eaf2">
        <v-container>
          <p class="titleView ma-2 pa-2">Create Test</p>
          <v-divider></v-divider>
          <FormTestDescription :test="test" ref="form1" />
          <v-card-actions class="ma-0 pa-2">
            <v-spacer></v-spacer>
            <v-btn color="black" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="#F9A826" @click="dialog = false">Create</v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FormTestDescription from "@/components/atoms/FormTestDescription";

export default {
  components: {
    FormTestDescription
  },
  data: () => ({
    dialog: false,
    test: {
      title: "",
      description: "",
      type: ""
    }
  }),
  methods: {
    createTest() {
      this.$router.push("/createtest");
    }
  }
};
</script>

<style>
.titleView {
  font-family: Roboto;
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
.card {
  max-width: 330px;
  height: 200px;
  border-radius: 3px;
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
  background-color: #fff;
  border-bottom: 2px solid transparent;
  margin: 0 16px 16px 0;
}
.icon {
  box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.5);
}
</style>