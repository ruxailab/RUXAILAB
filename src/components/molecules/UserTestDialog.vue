<template>
  <v-dialog
    v-model="dialogUser"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card color="#f9f5f0">
      <v-btn
        icon
        dark
        fab
        color="red"
        fixed
        right
        class="mt-6 mr-2"
        @click="dialogUser = false"
      >
        <v-icon x-large>mdi-arrow-u-left-bottom</v-icon>
      </v-btn>

      <v-col cols="12">
        <v-row justify="center">
          <span class="Titles mt-16 mb-8"
            >What kind of test are you looking to start?</span
          >
        </v-row>
      </v-col>

      <v-col cols="12" class="mt-6">
        <v-row justify="center">
          <v-col cols="1" />
          <v-col cols="4">
            <v-card
              hover
              color="white"
              class="cards ml-5 mr-5 group"
              height="520"
              @click=";(test.userTestType = 'unmoderated'), handleClick"
            >
              <v-row>
                <div class="mt-6">
                  <span class="Titles ml-10">SelfTest</span>
                  <br />
                  <span class="cardSubtitle2 ml-10"> UNMODERATED </span>
                </div>
              </v-row>
              <img
                style="margin-left: 80px"
                class="mt-5 mb-2"
                height="230"
                draggable="false"
                src="../../../public/SelfTest.svg"
                alt="Test Creation image"
              />
              <v-row class="mt-1">
                <v-sheet class="ml-13 mb-8 circle" height="20" width="20" />
                <span class="cardInternTitles ml-3">Answer on free time</span>
              </v-row>
              <v-row>
                <v-sheet class="ml-13 mb-8 circle" height="20" width="20" />
                <span class="cardInternTitles ml-3"
                  >Enhanced answer analysis</span
                >
              </v-row>
              <v-row>
                <v-sheet class="ml-13 mb-8 circle" height="20" width="20" />
                <span class="cardInternTitles ml-3">Task Customization</span>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="1"></v-col>
          <v-col cols="4">
            <v-card
              hover
              color="white"
              class="cards ml-5 mr-5"
              height="520"
              @click="chooseUserModerated"
            >
              <v-row>
                <div class="mt-6">
                  <span class="Titles ml-10">LiveTest </span>
                  <br />
                  <span class="cardSubtitle2 ml-10"> MODERATED</span>
                </div>
              </v-row>
              <img
                style="margin-left: 80px"
                class="mt-5 mb-2"
                height="230"
                draggable="false"
                src="../../../public/LiveTest.svg"
                alt="Test Creation image"
              />
              <v-row class="mt-1">
                <v-sheet class="ml-13 mb-8 circle" height="20" width="20" />
                <span class="cardInternTitles ml-3"
                  >Webcam, audio & screen record</span
                >
              </v-row>
              <v-row>
                <v-sheet class="ml-13 mb-8 circle" height="20" width="20" />
                <span class="cardInternTitles ml-3"
                  >Enhanced answer analysis</span
                >
              </v-row>
              <v-row>
                <v-sheet class="ml-13 mb-8 circle" height="20" width="20" />
                <span class="cardInternTitles ml-3">Moderated live test</span>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="1" />
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialogUser: {
      type: Boolean,
      required: true,
    },
    test: {
      type: Object,
      required: true,
    },
    handleClick: {
      type: Function,
      required: true,
    },
    chooseUserModerated: {
      type: Function,
      required: true,
    },
  },
}
</script>

<style scoped>
/* Styles for the component */
.Titles {
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

.cards {
  border-radius: 20px !important;
}
.cards :hover {
  cursor: pointer;
  transition: box-shadow 0.6s cubic-bezier(0.55, 0.9, 0.55, 2);
}

.circle {
  border-radius: 50%;
  background-color: orange;
  margin-right: 10px;
}

.cardSubtitle2 {
  color: rgba(139, 149, 156, 0.64);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardInternTitles {
  max-width: 270px;
  color: #626e76;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

/* Responsive styles */
@media (max-width: 600px) {
  .Titles {
    font-size: 28px; /* Adjust font size for smaller screens */
  }

  .circle {
    height: 10px;
    width: 10px;
  }

  .cardsContainer {
    flex-direction: column;
  }

  .cardSubtitle2 {
    font-size: 16px;
  }
  .cardInternTitles {
    max-width: 270px;
    font-size: 15px;
  }

  .cards {
    height: 250px; /* Adjust card height for smaller screens */
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .Titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }
  .cards {
    height: 300px; /* Adjust card height for medium screens */
    width: 100%;
  }
}

@media (min-width: 1160px) {
  .Titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }
  .cards {
    height: 350px; /* Adjust card height for larger screens */
  }
}
</style>
