<template style="background: #F9F5F0;">
  <div>
    <v-col cols="12">
      <v-row justify="center">
        <span class="Title ma-16"
          >What kind of test are you looking to start?</span
        >
      </v-row>
    </v-col>
    <v-col cols="12" class="mt-6">
      <v-row justify="center">
        <v-col cols="2"></v-col>
        <v-col cols="4">
          <v-card hover color="white" class="cards ml-10 mr-10" height="320">
            <v-row>
              <v-sheet
                class="ml-8 mt-6 mb-10"
                height="50"
                width="50"
                style="border-radius: 14px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
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
                class="ml-8 mt-8 mb-8"
                height="20"
                width="20"
                style="border-radius: 24px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
              ></v-sheet>
              <span class="cardInternTitles ml-3 mt-8"
                >Webcam, audio & screen record</span
              >
            </v-row>
            <v-row>
              <v-sheet
                class="ml-8  mb-8"
                height="20"
                width="20"
                style="border-radius: 24px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
              ></v-sheet>
              <span class="cardInternTitles ml-3"
                >Enhanced answer analysis</span
              >
            </v-row>
            <v-row>
              <v-sheet
                class="ml-8 mb-8"
                height="20"
                width="20"
                style="border-radius: 24px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
              ></v-sheet>
              <span class="cardInternTitles ml-3"
                >Moderated or non moderated tests</span
              >
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card hover color="white" class="cards ml-10 mr-10" height="320">
            <v-row>
              <v-sheet
                class="ml-8 mt-6 mb-10"
                height="50"
                width="50"
                style="border-radius: 14px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
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
                class="ml-8 mt-8 mb-8"
                height="20"
                width="20"
                style="border-radius: 24px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
              ></v-sheet>
              <span class="cardInternTitles ml-3 mt-8"
                >Webcam, audio & screen record</span
              >
            </v-row>
            <v-row>
              <v-sheet
                class="ml-8  mb-8"
                height="20"
                width="20"
                style="border-radius: 24px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
              ></v-sheet>
              <span class="cardInternTitles ml-3"
                >Enhanced answer analysis</span
              >
            </v-row>
            <v-row>
              <v-sheet
                class="ml-8 mb-8"
                height="20"
                width="20"
                style="border-radius: 24px;
                    background: linear-gradient(90deg, rgba(255, 81, 47, 0.30) 1%, rgba(240, 152, 25, 0.30) 97.63%);"
              ></v-sheet>
              <span class="cardInternTitles ml-3"
                >Moderated or non moderated tests</span
              >
            </v-row>
          </v-card>
        </v-col>
        <v-col cols="2"></v-col>
      </v-row>
    </v-col>
  </div>
</template>

<script>
export default {}
</script>

<style>
.Title {
  font-family: 'Poppins', sans-serif;
  font-size: 30px;
  font-style: normal;
  text-align: center;
  font-weight: 600;
  line-height: initial;
  background: linear-gradient(180deg, #ff5f1a 61.54%, #ffb443 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cardsTitle {
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  max-height: 23px;
  background: linear-gradient(180deg, #ff5f1a 77.32%, #ffb443 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cardSubtitle {
  color: #8b959c;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardInternTitles {
  color: #626e76;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}
.cards {
  border-radius: 20px !important;
  background: #fff !important;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25) !important;
}
.circle {
  min-width: 100px;
  height: 60px;
  width: 60px;
  background-color: #bbb;
  border-radius: 30px;
  display: inline-block;
}
.v-main {
  background: #f9f5f0;
}
</style>
