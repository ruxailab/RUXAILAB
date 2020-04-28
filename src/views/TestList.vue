<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card>
          <v-list>
            <v-list-item v-for="test in tests" :key="test.id">
              <v-list-item-content @click="openTest(test.id)">
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
                    <v-btn icon @click="deleteTest(test)">
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
    <v-btn  large dark fab  fixed bottom right @click="changerouter()">
      <v-icon >mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>


<script>
export default {
  data: () => ({}),
  methods: {
    deleteTest(item) {
      this.$store.dispatch("deleteTest", item);
      this.$store.dispatch("getTests", { doc: this.$route.params.tests });

    },
    changerouter(){
      this.$router.push('/createtest')
    },
    openTest(id){
      this.$router.push('/testview/'+id)
    }
  },
  computed: {
    tests() {
      return this.$store.getters.tests;
    }
  },
  watch:{
    tests: function (){
      this.$store.dispatch("getTest", { id: this.id });
    }
  },
  created() {
    this.$store.dispatch("getTests", { doc: this.$route.params.tests });
  }
};
</script>

