<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card>      
          <v-text-field
          class="mx-3 pt-5"
          append-icon="mdi-magnify"
          label="Search"
          v-model="search"
          >
          </v-text-field>    
          
          <v-data-table
          :headers="headers"
          :items="tests"
          @click:row="openTest"
          :items-per-page="itemsPP"
          show-expand
          :loading="loading"
          :search="search"
          >
            <!-- <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title><b>Your Tests</b></v-toolbar-title>
              </v-toolbar>
            </template> -->
            
            

            <template v-slot:expanded-item="{ headers, item }"> <!-- expanded description -->
              <td :colspan="headers.length" class="pa-3">
                <h2 class="mb-1">{{ item.title }}</h2>
                <div class="caption" v-if="item.description">{{ item.description }}</div>
                <div class="caption" v-else>Test has no description</div>
              </td>
            </template>

            <template v-slot:item.type="{ item }"> <!-- item type -->
                <v-layout justify-center>
                  <v-btn
                  v-if="item.type"
                  rounded
                  small
                  elevation="1"
                  >
                    <span style="font-size: 7pt">{{ item.type }}</span>
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
    itemsPP: 5,
    search: '',
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
      return this.$store.getters.tests || []; //retorna um array vazio qnd test for undefined ou null e permite data table renderizar
    },
    loading() {
      return this.$store.getters.loading;
    }
  },
  created() {
    this.$store.dispatch("getTests", { doc: this.$route.params.tests });
  }
};
</script>
