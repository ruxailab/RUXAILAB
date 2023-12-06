<template>
  <div>
    <h2
      style="font-weight: 400; display: flex; justify-content: center; margin: 30px 0px"
    >
      {{ $t('pages.createTest.title') }}
    </h2>

    <v-row justify="center" style="padding: 0px 30px;">
      <v-row style="max-width: 90%" justify="center">
        <v-col cols="12" md="6">
          <v-card class="card" flat :ripple="false" @click="dialog = true">
            <v-row align="center">
              <v-col cols="12" md="5">
                <v-img
                  contain
                  src="@/assets/createView/blankCanvas.svg"
                  max-height="200"
                />
              </v-col>
              <v-col cols="12" md="6" class="card-text">
                <div class="card-title">
                  {{ $t('pages.createTest.blanckTitle') }}
                </div>
                <div>
                  {{ $t('pages.createTest.blanckSubtitle') }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card
            class="card"
            flat
            :ripple="false"
            @click="pushToFromTemplate()"
          >
            <v-row align="center">
              <v-col cols="12" md="5">
                <v-img
                  contain
                  src="@/assets/createView/createFromTemplate.svg"
                  max-height="200"
                />
              </v-col>
              <v-col cols="12" md="6" class="card-text-box">
                <div class="card-title">
                  {{ $t('pages.createTest.templateTitle') }}
                </div>
                <div>
                  {{ $t('pages.createTest.templateSubtitle') }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-row>

    <v-dialog v-model="dialog" max-width="80%">
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
import FormTestDescription from '@/components/atoms/FormTestDescription'
import TestAdmin from '@/models/TestAdmin'
import Test from '@/models/Test'

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

<style scoped>
.dialog-title {
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
  border: 1px solid rgb(201, 201, 201);
  padding: 30px;
  height: 250px;
}
.card-title {
  font-size: 25px;
  color: #f9a826;
  margin: 0px 0px 10px 0px;
}
.card-text-box {
  margin: 0px 0px 0px 30px;
}

@media screen and (max-width: 960px) {
  .dialog-title {
    display: flex;
    text-align: center;
    justify-content: center;
  }
  .card-text-box {
    margin: 20px 0px 0px 0px;
  }
  .card {
    height: auto;
  }
}
</style>
