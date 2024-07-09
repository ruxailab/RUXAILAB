<template>
  <div>
    <v-dialog v-model="isOpen" fullscreen transition="dialog-bottom-transition">
      <v-card color="#f9f5f0">
        <ButtonBack @click="$emit('close')" />

        <v-col cols="12">
          <v-row justify="center">
            <span class="titles mt-8 mb-8">
              What type of test are you looking to start?
            </span>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-row class="cardsContainer">
            <v-col cols="12" md="4" sm="10" class="card">
              <CardTypeTestImage 
                title="SelfTest"
                type="UNMODERATED"
                :img="require('../../../public/SelfTest.svg')"
                :texts="['Answer on free time', 'Enhanced answer analysis', 'Task Customization']"
                @click="setType"
              />
            </v-col>

            <v-col cols="12" md="4" sm="10" class="card">
              <CardTypeTestImage 
                title="LiveTest"
                type="MODERATED"
                :img="require('../../../public/LiveTest.svg')"
                :texts="['Webcam, audio & screen record', 'Enhanced answer analysis', 'Moderated live test']"
                @click="setType"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ButtonBack from '@/components/atoms/ButtonBack.vue'
import CardTypeTestImage from '@/components/atoms/CardTypeTestImage.vue'

export default {
  components: {
    ButtonBack,
    CardTypeTestImage,
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false,
      require: true,
    },
  },

  methods: {
    setType(type) {
      const test = {}
      if (type === 'UNMODERATED') test.userTestType = type.toLowerCase()
      if (type === 'MODERATED') {
        test.userTestType = 'moderated'
        test.userTestStatus = {
          user: false,
          moderator: false,
          consentStatus: 'open',
          preTestStatus: 'closed',
          postTestStatus: 'closed',
        }
      }
      
      this.$emit('setUser', test)
    }
  }
}
</script>

<style scoped>
.titles {
  font-size: 38px;
  text-align: center;
  font-weight: 600;
  color: #f99726;
}

.cardsContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.card {
  margin: auto;
}

@media (max-width: 600px) {
  .titles {
    font-size: 28px; /* Adjust font size for smaller screens */
  }

  .cardsContainer {
    flex-direction: column;
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }

  .cardsContainer {
    flex-direction: column;
  }
}

@media (min-width: 1160px) {
  .titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }
}
</style>