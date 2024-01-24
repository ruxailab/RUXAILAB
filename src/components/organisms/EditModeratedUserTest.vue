<template>
  <v-tabs
    v-if="type == 'tabs'"
    background-color="transparent"
    color="#FCA326"
    class="pb-0 mb-0"
  >
    <v-tab @click="tabClicked(0)">
      PRE-TEST
    </v-tab>
    <v-tab @click="tabClicked(1)">
      TASKS
    </v-tab>
    <v-tab @click="tabClicked(2)">
      POST-TEST
    </v-tab>
  </v-tabs>

  <v-col v-else-if="type == 'content'" cols="12">
    <v-row>
      <v-col cols="8" v-if="index == 0">
        <v-card style="background: #f5f7ff" flat class="cards">
          <v-col cols="12" class="pb-0 px-5 pt-4">
            <span class="cardsTitle ml-3"> Consent Form</span>
            <br />
            <span class="cardsSubtitle ml-3"
              >This is a Consent Checkbox with a text for confirm the
              consentiment</span
            >
          </v-col>
          <v-textarea
            rows="3"
            outlined
            color="orange"
            class="mx-6 mt-3"
            placeholder="Consent Form..."
          ></v-textarea>
        </v-card>
      </v-col>
      <v-col cols="4" class="pl-0" style="height: 19vh;" v-if="index == 0">
        <v-card flat style="background: #f5f7ff" class="cards">
          <v-col cols="12" class="pb-0 pt-6 px-8">
            <span class="cardsTitle mt-4">Welcome message</span>
            <br />
            <span class="cardsSubtitle"
              >This message will be the first thing participants see before the
              session is started.</span
            >
          </v-col>
          <v-textarea
            outlined
            color="orange"
            class="mx-6 mt-3"
            placeholder="Thank you for participating..."
          ></v-textarea>
          <v-col cols="12" class="pb-0 px-8">
            <span class="cardsTitle">Landing Page</span>
            <br />
            <span class="cardsSubtitle"
              >This URL will automatically load when participants starts
              session.</span
            >
            <v-text-field
              class="mt-3"
              style="border-radius: 20px;"
              placeholder="https://www.ruxailab.com"
              outlined
              color="orange"
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="pb-0 px-8">
            <span class="cardsTitle">Participant camera</span>
            <v-radio-group class="pt-0">
              <v-radio label="Optional" color="orange" value="one"></v-radio>
              <v-radio label="Required" color="orange" value="two"></v-radio>
              <v-radio label="Disabled" color="orange" value="three"></v-radio>
            </v-radio-group>
          </v-col>
        </v-card>
      </v-col>
      <v-col cols="8" class="pt-0" v-if="index == 0">
        <v-card style="background: #f5f7ff" flat class="cards">
          <v-col cols="12">
            <span class="cardsTitle ml-3">Pre-Form</span>
            <br />
            <span class="cardsSubtitle ml-3"
              >This is a pre-questions you make to get participants data</span
            >
            <UserVariables />
          </v-col>
        </v-card>
      </v-col>
      <v-col cols="12" v-if="index == 1">
        <v-card
          v-for="(item, n) in tasksNumber"
          :key="n"
          style="background: #f5f7ff"
          flat
          class="cards mb-5"
        >
          <v-col cols="12" class="pb-0 px-5 pt-4">
            <span class="cardsTitle ml-3">Task</span>
            <br />
            <span class="cardsSubtitle ml-3">Task Description</span>
          </v-col>
          <v-textarea
            rows="3"
            outlined
            color="orange"
            class="mx-6 mt-3"
            placeholder="Write what you want to task..."
          ></v-textarea>
          <v-row justify="center">
            <v-btn
              fab
              depressed
              dark
              color="rgb(249, 168, 38)"
              style="margin-bottom: -30px; z-index: 3;"
              ><v-icon size="35">mdi-plus</v-icon></v-btn
            >
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" v-if="index == 2">
        <v-card
          style="background: #f5f7ff; min-height: 300px;"
          flat
          class="cards"
        >
          <v-col cols="12" class="pb-0 px-5 pt-4">
            <span class="cardsTitle ml-3">Post Form</span>
            <br />
            <span class="cardsSubtitle ml-3"
              >This is a post-questions you make to get participants data</span
            >
            <FormPostTest />
          </v-col>
        </v-card>
      </v-col>
      <v-col cols="12" v-if="index == 2" class="pt-0">
        <v-card style="background: #f5f7ff" flat class="cards">
          <v-col cols="12" class="pb-0 px-5 pt-4">
            <span class="cardsTitle ml-3">Final message</span>
            <br />
            <span class="cardsSubtitle ml-3"
              >This is a Final message you leave to the participant on finish
              test.</span
            >
          </v-col>
          <v-textarea
            rows="3"
            outlined
            color="orange"
            class="mx-6 mt-3"
            placeholder="Thank you for participating..."
          ></v-textarea>
        </v-card>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import FormPostTest from '../atoms/FormPostTest.vue'
import UserVariables from '../atoms/UserVariables.vue'
export default {
  data: () => ({
    tasksNumber: [1, 2, 3, 4],
  }),
  components: { UserVariables, FormPostTest },
  props: {
    type: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    object: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    tabClicked(index) {
      this.$emit('tabClicked', index)
    },
  },
}
</script>

<style scoped>
.cards {
  border-radius: 20px;
}
.cardsTitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardsSubtitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
