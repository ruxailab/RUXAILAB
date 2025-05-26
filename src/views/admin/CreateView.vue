<template>
  <div class="page-container">
    <v-col cols="12" />
    <span class="Title mb-14 mt-8" style="display: flex; justify-content: center;">
      {{ $t('pages.createTest.title') }}
    </span>

    <v-row justify="center" class="responsive-row">
      <v-row style="max-width: 90%" justify="center">
        <v-col cols="12" md="6">
          <v-card hover class="card" :ripple="false" @click="$router.push('/choose')">
            <v-row align="center">
              <v-col cols="12" md="5">
                <v-img contain src="@/assets/createView/blankCanvas.svg" max-height="200" />
              </v-col>
              <v-col cols="12" md="6" class="card-text">
                <div class="card-title">
                  {{ $t('pages.createTest.blankTitle') }}
                </div>
                <div>
                  {{ $t('pages.createTest.blankSubtitle') }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card hover class="card" :ripple="false" @click="pushToFromTemplate()">
            <v-row align="center">
              <v-col cols="12" md="5">
                <v-img contain src="@/assets/createView/createFromTemplate.svg" max-height="200" />
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
  </div>
</template>

<script>
import TestAdmin from '@/models/TestAdmin'
import Test from '@/models/Test'

export default {
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

      this.sendManager(testId)
    },
    sendManager(id) {
      this.$router.push(`/managerview/${id}`)
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.submit()
      }
    },
  },
}
</script>

<style scoped>
.page-container {
  height: 93vh;
  background-color: #f9f5f0;
  /* fundo padrão para desktop/tablet */
}

dialog-title {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

.Title {
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

.responsive-row {
  padding: 0px 30px;
}

.card {
  border-radius: 20px;
  padding: 30px;
  height: 250px;
}

.card-title {
  font-size: 25px;
  color: #f9a826;
  margin: 0 0 10px 0;
}

.card-text-box {
  margin: 0 0 0 30px;
}

@media screen and (max-width: 960px) {
  .dialog-title {
    display: flex;
    text-align: center;
    justify-content: center;
  }

  .card-text-box {
    margin: 20px 0 0 0;
  }

  .card {
    height: auto;
  }
}

/* Responsividade para dispositivos móveis (até 600px) */
@media screen and (max-width: 600px) {
  .page-container {
    background-color: #ffffff;
  }

  .responsive-row {
    padding: 0px 10px !important;
  }

  .Title {
    font-size: 28px;
  }

  .card {
    padding: 20px;
    height: auto;
  }

  .card-title {
    font-size: 20px;
  }

  .card-text-box {
    margin: 10px 0 0 0;
  }
}
</style>
