<template>
  <div>
    <v-dialog
      :value="isOpen"
      @input="$emit('update:isOpen', $event)"
      fullscreen
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card color="#f9f5f0">
        <ButtonBack @click="$emit('close')" />

        <v-col lg="9" md="8" sm="12" class="ml-auto mr-auto pt-10">
          <p class="titles ml-5">
            {{ heading }}
          </p>
          <p class="cardSubtitle ml-5">
            {{ subHeading }}
          </p>
        </v-col>

        <v-row align="center" justify="center" class="cardRow ma-0 pa-0">
          <v-col class="ml-auto mr-auto" sm="10" md="8" lg="4">
            <v-card color="white" class="pb-5" style="border-radius: 20px !important">
              <v-col cols="11" class="ml-6">
                <p class="cardInternTitles mt-4">
                  {{ testName }}
                </p>
                <v-text-field v-model="test.title" class="mt-3" :label="testName" outlined color="orange"
                  @change="$store.commit('SET_LOCAL_CHANGES', true)" />

                <p class="cardInternTitles">
                  {{ testDescription }}
                </p>
                <v-textarea v-model="test.description" outlined color="orange" class="mt-3" :label="testDescription"
                  @change="$store.commit('SET_LOCAL_CHANGES', true)" />

                <v-row class="d-flex align-center" no-gutters>
                  <v-col cols="9" class="d-flex align-center">
                    <v-checkbox v-model="test.isPublic" class="ml-2" color="orange" :label="testLabel" />
                  </v-col>
                  <v-col cols="3" class="d-flex justify-end">
                    <v-btn dark fab depressed color="orange" class="mr-2 circleOrange" @click="validate">
                      <v-icon x-large>
                        mdi-arrow-right
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-card>
          </v-col>

          <v-col v-if="!$vuetify.breakpoint.mdAndDown" cols="5" class="imageColumn">
            <img height="500" src="../../../public/createSVG.svg" alt="Test Creation image" />
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <CreateTestUserDialog
      :is-open="userDialog"
      @setUser="; (test = { ...test, ...$event}), (userDialog = false), submit()"
      @close="userDialog = false"
    />
  </div>
</template>

<script>
import Test from '@/models/Test';
import TestAdmin from '@/models/TestAdmin';
import ButtonBack from '@/components/atoms/ButtonBack.vue';
import CreateTestUserDialog from '@/components/dialogs/CreateTestUserDialog.vue';

export default {
  components: {
    ButtonBack,
    CreateTestUserDialog,
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false,
      required: true,
    },

    testType: {
      type: String,
      default: '',
      required: true,
    },

    heading: {
      type: String,
      default: '',
      required: true,
    },

    subHeading: {
      type: String,
      default: '',
      required: true,
    },

    testName: {
      type: String,
      default: '',
      required: true,
    },

    testDescription: {
      type: String,
      default: '',
      required: true,
    },

    testLabel: {
      type: String,
      default: '',
      required: true,
    },
  },

  data: () => ({
    userDialog: false,
    test: {
      title: '',
      description: '',
      isPublic: false,
      userTestType: '',
      userTestStatus: {},
    },
  }),

  computed: {
    user() {
      return this.$store.getters.user;
    },
  },

  methods: {
    validate() {
      if (this.test.title.length === 0) return this.$toast.warning('Enter a Title');
      if (this.test.title.length > 200) return this.$toast.warning('Title cannot exceed 200 characters');
      if (this.test.description.length > 600) return this.$toast.warning('Description cannot exceed 600 characters');

      this.handleTestType();
    },

    handleTestType() {
      if (this.testType === 'User') return this.userDialog = true
      return this.submit()
    },

    async submit() {
      const test = new Test({
        id: null,
        testTitle: this.test.title,
        testDescription: this.test.description,
        testType: this.testType,
        isPublic: this.test.isPublic,
        userTestType: this.test.userTestType,
        userTestStatus: this.test.userTestStatus,
        testAdmin: new TestAdmin({
          userDocId: this.user.id,
          email: this.user.email,
        }),
        creationDate: Date.now(),
        updateDate: Date.now(),
      });

      const testId = await this.$store.dispatch('createNewTest', test)
      
      if (this.testType === 'Accessibility') {
        this.$router.push(`/sample`)
      } else {
        this.$router.push(`/managerview/${testId}`)
      }
    },
  },
  watch: {
    isOpen(val) {
      if (!val) {
        this.test = {
          title: '',
          description: '',
          isPublic: false,
          userTestType: '',
          userTestStatus: {}
        }
      }
    }
  },
}
</script>

<style scoped>
.titles {
  font-size: 38px;
  font-weight: 600;
  color: #f99726;
}

.cardSubtitle {
  color: #8b959c;
  font-size: 20px;
  font-weight: 600;
}

.cardRow {
  display: flex;
  flex-wrap: wrap;
}

.cardInternTitles {
  max-width: 270px;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.imageColumn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  padding-right: 30vh;
}

@media (max-width: 600px) {
  .titles {
    font-size: 28px;
    /* Adjust font size for smaller screens */
  }

  .cardSubtitle {
    font-size: 15px;
  }

  .cardRow {
    flex-direction: column;
    align-items: center;
  }

  .cardInternTitles {
    max-width: 270px;
    font-size: 15px;
  }

  .circleOrange {
    margin-top: 10px;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .titles {
    font-size: 32px;
    /* Adjust font size for medium screens */
  }

  .cardRow {
    flex-direction: column;
    align-items: center;
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px;
    /* Adjust font size for larger screens */
  }
}
</style>