<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="10">
        <v-card :ripple="false" @click="openDropdown">       
          <v-text-field
          @click.stop
          class="mx-3 pt-5"
          append-icon="mdi-magnify"
          label="Search"
          v-model="search"
          >
          </v-text-field>    
          
          <v-data-table
          :headers="headers"
          :items="tests"
          @click:row="setTest"
          :items-per-page="itemsPP"
          show-expand
          :loading="loading"
          :search="search"
          >         
            <template v-slot:expanded-item="{ headers, item }"> <!-- expanded description -->
              <td :colspan="headers.length" class="pa-3">
                <h2 class="mb-1">{{ item.title }}</h2>
                <div class="caption" v-if="item.description">{{ item.description }}</div>
                <div class="caption" v-else>Test has no description</div>
              </td>
            </template>

            <template v-slot:item.type="{ item }"> <!-- item type -->
              <td @click.stop style="cursor: default">
                  <v-btn
                  v-if="item.type"
                  rounded
                  small
                  elevation="1"
                  >
                    <span style="font-size: 7pt">{{ item.type }}</span>
                  </v-btn>
              </td>
            </template>

            <template v-slot:item.edit="{ item }" > <!-- edit button -->
              <td @click.stop style="cursor: default">
                <v-btn 
                icon
                @click="editItem(item)"
                small
                >
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
              </td>
            </template>

            <template v-slot:item.delete="{ item }"> <!-- delete button -->
              <td @click.stop style="cursor: default">
                <v-btn 
                icon
                @click="deleteTest(item)"
                small
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-menu 
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      absolute
      offset-y
    > 
      <v-list>
        <v-list-item @click="openTest(test)">
          <v-list-item-title>Open Test</v-list-item-title>
        </v-list-item>

        <v-list-item @click="openAnswer(test)">
          <v-list-item-title>Open Answers</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn  large dark fab  fixed bottom right @click="createTest()"> <!-- Add Button -->
      <v-icon >mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>


<script>
export default {
  data: () => ({
    itemsPP: 5,
    search: '',
    showMenu: false,
    x: 0,
    y: 0,
    test: {},
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
    items: [
      {title: 'Open Test'},
      {title: 'Open Answers'}
    ]
  }),
  methods: {
    deleteTest(item) {
      this.$store.dispatch("deleteTest", item);
      this.$store.dispatch("getTests", { doc: this.$route.params.tests });

    },
    openDropdown(e) {
      e.preventDefault()
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    createTest(){
      this.$router.push('/createtest')
    },
    openTest(test){
      if(!this.deleting && !this.editing)
        this.$router.push('/testview/'+test.id)
    },
    editItem(test){
       this.$router.push('/edittest/'+test.id)
    },
    setTest(test) {
      this.test = Object.assign({}, test);
      // this.openDropdown()
    },
    openAnswer(test) {
      this.$router.push('/answerview/' + test.id);
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
    if (!this.$store.test) this.$store.dispatch("getTests", { doc: this.$route.params.tests });
  }
};
</script>