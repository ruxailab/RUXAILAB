<template style="background: #F9F5F0;">
  <div>
    <v-col cols="12">
      <v-row justify="center">
        <span class="Titles ma-16"
          >What kind of test are you looking to start?</span
        >
      </v-row>
    </v-col>
    <v-col cols="12" class="mt-6">
      <v-row justify="center">
        <v-col cols="1"></v-col>
        <v-col cols="4">
          <v-card
            hover
            color="white"
            class="cards ml-5 mr-5 group"
            height="350"
            @click="test.testType = 'HEURISTICS'"
          >
            <v-row>
              <v-sheet
                class="ml-8 mt-6 mb-10 insideCards"
                height="50"
                width="50"
                ><v-img
                  class="ma-2"
                  style="z-index: 0;"
                  src="../../../public/specialist.png"
                ></v-img
              ></v-sheet>
              <div class="mt-6">
                <span class="cardsTitle ml-4">Usability Heuristic</span>
                <br />
                <span class="cardSubtitle ml-4"> Test </span>
              </div>
            </v-row>
            <v-divider></v-divider>
            <v-row class="mt-1">
              <v-sheet
                class="ml-10 mt-8 mb-8 circle"
                height="20"
                width="20"
              ></v-sheet>
              <span class="cardInternTitles ml-3 mt-8"
                >Usability Percentage</span
              >
            </v-row>
            <v-row>
              <v-sheet
                class="ml-10 mb-8 circle"
                height="20"
                width="20"
              ></v-sheet>
              <span class="cardInternTitles ml-3">Final Report PDF</span>
            </v-row>
            <v-row>
              <v-sheet
                class="ml-10 mb-8 circle"
                height="20"
                width="20"
              ></v-sheet>
              <span class="cardInternTitles ml-3"
                >Invite specialists to evaluate your application</span
              >
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="1"></v-col>
        <v-col class="" cols="4">
          <v-card hover color="white" class="cards ml-5 mr-5" height="350" @click="test.testType = 'USER'">
            <v-row>
              <v-sheet
                class="ml-8 mt-6 mb-10 insideCards"
                height="50"
                width="50"
                ><v-img
                  class="ma-3"
                  style="z-index: 0;"
                  src="../../../public/user.png"
                ></v-img
              ></v-sheet>
              <div class="mt-6">
                <span class="cardsTitle ml-4">Usability User</span>
                <br />
                <span class="cardSubtitle ml-4"> Test </span>
              </div>
            </v-row>
            <v-divider></v-divider>
            <v-row class="mt-1">
              <v-sheet
                class="ml-10 mt-8 mb-8 circle"
                height="20"
                width="20"
              ></v-sheet>
              <span class="cardInternTitles ml-3 mt-8"
                >Webcam, audio & screen record</span
              >
            </v-row>
            <v-row>
              <v-sheet
                class="ml-10 mb-8 circle"
                height="20"
                width="20"
              ></v-sheet>
              <span class="cardInternTitles ml-3"
                >Enhanced answer analysis</span
              >
            </v-row>
            <v-row>
              <v-sheet
                class="ml-10 mb-8 circle"
                height="20"
                width="20"
              ></v-sheet>
              <span class="cardInternTitles ml-3"
                >Moderated or non moderated tests</span
              >
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="1"></v-col>
      </v-row>
    </v-col>
    <v-dialog v-model="dialog" fullscreen>
      <v-card color="#e8eaf2">
        <v-container>
          <p class="dialog-title ma-2 pa-2">
            {{ $t('pages.createTest.create') }}
          </p>
          <v-divider />
          <FormTestDescription ref="form" :test="test" :lock="false" />
          <v-card-actions class="ma-0 pa-2">
            <v-spacer />
            <v-btn color="black" text @click="dialog = false">
              {{ $t('buttons.cancel') }}
            </v-btn>
            <v-btn color="#F9A826" @click="validate()">
              {{ $t('buttons.create') }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FormTestDescription from '@/components/atoms/FormTestDescription.vue'
export default {
  components: {
    FormTestDescription,
  },
  data: () => ({
    dialog: false,
    object: {},
    test: {
      title: '',
      description: '',
      type: '',
    },
    testID: null,
  }),
  computed: {
    user() {
      return this.$store.getters.user
    },
  },
  watch: {
    dialog() {
      this.test = {
        title: '',
        description: '',
        type: '',
      }
      this.object = {}

      if (!this.dialog) {
        this.$refs.form.resetVal()
        this.dialog = false
      }
    },
  },
  methods: {
    pushToFromTemplate() {
      this.$router.push('/fromtemplate')
    },
    async submit() {
      const test = new Test({
        ...this.test,
        id: null,
        testAdmin: new TestAdmin({
          userDocId: this.user.id,
          email: this.user.email,
        }),
        creationDate: Date.now(),
        updateDate: Date.now(),
      })

      const testId = await this.$store.dispatch('createNewTest', test)
      console.log(test);

      this.sendManager(testId)
    },
    sendManager(id) {
      this.$router.push(`/managerview/${id}`)
    },
    validate() {
      if (this.$refs.form.valida()) {
        this.submit()
      }
    },
  },
}
</script>

<style>
.Titles {
  font-family: 'Poppins', Helvetica;
  font-size: 38px;
  font-style: normal;
  text-align: center;
  font-weight: 600;
  line-height: initial;
  background: #f99726;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cardsTitle {
  font-family: 'Poppins', Helvetica;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  max-height: 23px;
  background-color: #f99726;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cardSubtitle {
  color: #8b959c;
  font-size: 20px;
  font-family: 'Poppins', Helvetica;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardInternTitles {
  max-width: 270px;
  font-family: 'Poppins', Helvetica;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
.cards {
  border-radius: 20px !important;
}
.cards :hover {
  cursor: pointer;
  transition: box-shadow 0.6s cubic-bezier(0.55, 0.9, 0.55, 2);
}
.insideCards {
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(255, 81, 47, 0.3) 1%,
    rgba(240, 152, 25, 0.3) 97.63%
  );
  z-index: 10;
}
.circle {
  border-radius: 24px;
  background: linear-gradient(
    90deg,
    rgba(255, 80, 45, 0.514) 1%,
    rgba(240, 150, 25, 0.432) 97.63%
  );
}
.v-main {
  background: #f9f5f0;
}
</style>
