<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card>
          <v-list>
            <v-list-item v-for="test in tests" :key="test.id">
              <v-list-item-content>
                <v-list-item-title v-text="test.title"></v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-row>
                  <v-col>
                    <v-btn icon>
                      <v-icon>mdi-lead-pencil</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn icon>
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
export default {
  data: () => ({
  }),
  computed: {
    tests() {
      return this.$store.getters.tests;
    }
  },
  created(){
      this.$store.dispatch("getTests",{doc:this.$route.params.tests})
  }
};
</script>