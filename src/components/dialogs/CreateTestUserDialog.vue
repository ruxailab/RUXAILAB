<template>
  <div>
    <v-dialog
      :model-value="isOpen"
      fullscreen
      transition="dialog-bottom-transition"
      @update:model-value="$emit('update:isOpen', $event)"
    >
      <v-card color="#f9f5f0">
        <v-row 
          justify="center" 
          align="center" 
          class="cardRow ma-0 pa-0"
        >
          <v-col
            cols="11"
            class="mr-8"
          >
            <v-row justify="center">
              <span class="titles mt-4 mb-8">
                {{ $t('Createblank.title') }}
              </span>
            </v-row>
          </v-col>
          <ButtonBack @click="$emit('close')" />
        </v-row>
        <v-row
          align="center"
          justify="center"
        >
          <v-col cols="12">
            <v-row class="cardsContainer">
              <v-col
                cols="12"
                md="4"
                sm="10"
                class="card"
              >
                <CardTypeTestImage
                  :title="$t('Createblank.UsabilityUser.SelfTest.title')"
                  :type="$t('Createblank.UsabilityUser.SelfTest.type')"
                  :img="require('../../../public/SelfTest.svg')"
                  :texts="$t('Createblank.UsabilityUser.SelfTest.text')"
                  @click="setType"
                />
              </v-col>

              <v-col
                cols="12"
                md="4"
                sm="10"
                class="card"
              >
                <CardTypeTestImage
                  :title="$t('Createblank.UsabilityUser.LiveTest.title')"
                  :type="$t('Createblank.UsabilityUser.LiveTest.type')"
                  :img="require('../../../public/LiveTest.svg')"
                  :texts="$t('Createblank.UsabilityUser.LiveTest.text')"
                  @click="setType"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import ButtonBack from '@/components/atoms/ButtonBack.vue'
import CardTypeTestImage from '@/components/atoms/CardTypeTestImage.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
    required: true,
  },
})

const emit = defineEmits(['update:isOpen', 'close', 'setUser'])

const setType = (type) => {
  const normalizedType = type.toLowerCase()
  const test = {}
  if (normalizedType === 'unmoderated') test.userTestType = normalizedType
  if (normalizedType === 'moderated') {
    test.userTestType = normalizedType
    test.userTestStatus = {
      user: false,
      moderator: false,
      consentStatus: 'open',
      preTestStatus: 'closed',
      postTestStatus: 'closed',
    }
  }

  emit('setUser', test)
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

.cardRow {
  display: flex;
  flex-wrap: wrap;
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