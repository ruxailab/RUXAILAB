<template>
  <v-container>
    <v-row justify="center">
      <!-- aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa -->
      <!-- <v-col cols="10">
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
      </v-col> -->
      <!-- aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa -->
      <v-col cols="10">
        <v-card>
          <v-data-table
          :headers="headers"
          :items="tests"
          @click:row="openTest"
          items-per-page="5"
          show-expand

          >
            <!-- add loading and learn to show while being loaded -->
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title><b>Available Tests</b></v-toolbar-title>
              </v-toolbar>
            </template>
            
            <template v-slot:expanded-item="{ headers, item }"> <!-- expanded description -->
              <td :colspan="headers.length" class="pa-3">
                <h2 class="mb-1">{{ item.title }}</h2>
                <div class="caption" v-if="item.description">{{ item.description }}</div>
                <div class="caption" v-else>Test has no description</div>
              </td>
            </template>

            <!-- <template v-slot:item.task="{ item }">
              <v-layout justify-center>
                <span> {{ item.tasks.length }}</span>
              </v-layout>
            </template> -->

            <template v-slot:item.type="{ item }"> <!-- item type -->
                <v-layout justify-center>
                  <v-btn
                  v-if="item.type"
                  rounded
                  small
                  >
                    {{ item.type }}
                  </v-btn>
                </v-layout>
            </template>

            <template v-slot:item.edit="{ item }"> <!-- edit button -->
              <v-btn 
              icon
              @click="editItem(item)"
              small
              >
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>

            <template v-slot:item.delete="{ item }"> <!-- delete button -->
                <v-btn 
                icon
                @click="deleteTest(item)"
                small
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
            </template>


          </v-data-table>
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
  data: () => ({
    headers: [
      {
        text: 'Title',
        align: 'start',
        value: 'title'
      },
      {text: 'Id', value: 'id', align: 'center'},
      {text: 'Tasks', value: 'tasks.length', align: 'center'},
      {text: 'Type', value: 'type', align: 'center'},   
      {text: 'Edit', value: 'edit', align:'center', sortable: false}, 
      {text: 'Delete', value: 'delete', align:'center',sortable: false},
      {text: '', value: 'data-table-expand'}
    ],
  }),
  methods: {
    deleteTest(item) {
      this.$store.dispatch("deleteTest", item);
      this.$store.dispatch("getTests", { doc: this.$route.params.tests });

    },
    changerouter(){
      this.$router.push('/createtest')
    },
    openTest(test){
      this.$router.push('/testview/'+test.id)
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
