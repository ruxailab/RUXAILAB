<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-card color="#f9f5f0">
      <v-btn
        icon
        dark
        fab
        color="red"
        fixed
        right
        class="mt-6 mr-2 arrowBack"
        @click="dialog = false"
      >
        <v-icon x-large>mdi-arrow-u-left-bottom</v-icon>
      </v-btn>

      <v-row align="center" justify="center" class="cardRow">
        <v-col cols="10" class="mt-16 ml-auto">
          <span class="Titles ml-5">Test Creation</span>
          <br />
          <span class="cardSubtitle ml-5">Add a name to your test!</span>
        </v-col>
        <v-col class="ml-auto mr-auto" cols="auto">
          <v-card
            color="white"
            style="border-radius: 20px !important"
            height="480"
          >
            <v-col cols="11">
              <div class="mt-4">
                <span class="cardInternTitles ml-6">Test Name</span>
              </div>
              <v-text-field
                v-model="test.testTitle"
                class="ml-6 mt-3"
                label="Test Name"
                outlined
                color="orange"
                @change="$store.commit('SET_LOCAL_CHANGES', true)"
              />
              <span class="cardInternTitles ml-6">Test Description</span>
              <v-textarea
                v-model="test.testDescription"
                outlined
                color="orange"
                class="ml-6 mt-3"
                label="Test Description"
                @change="$store.commit('SET_LOCAL_CHANGES', true)"
              />
              <v-row>
                <v-checkbox
                  v-model="test.isPublic"
                  class="ml-10 mt-8"
                  color="orange"
                  label="Turn this test public to all users"
                />
                <v-btn
                  dark
                  fab
                  large
                  color="orange"
                  class="ml-auto mt-4 mr-2 circleOrange"
                  @click="handleClick"
                >
                  <v-icon x-large>
                    mdi-arrow-right
                  </v-icon>
                </v-btn>
              </v-row>
            </v-col>
          </v-card>
        </v-col>
        <v-col cols="5" class="imageColumn">
          <img
            height="500"
            draggable="false"
            src="../../../public/createSVG.svg"
            alt="Test Creation image"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
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
  },
}
</script>

<style scoped>
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
.cardRow {
  display: flex;
  flex-wrap: wrap;
}
.imageColumn {
  display: flex;
  justify-content: center;
  align-items: center;
}

.cardSubtitle {
  color: #8b959c;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
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
  .cardRow {
    flex-direction: column;
    align-items: center;
  }
  .cardSubtitle {
    font-size: 15px;
  }
  .cardSubtitle2 {
    font-size: 16px;
  }
  .cardInternTitles {
    max-width: 270px;
    font-size: 15px;
  }
  .circleOrange {
    margin-top: 10px;
  }
  .mt-6 {
    margin-top: 30px; /* Adjust margin for smaller screens */
  }
}

@media (min-width: 601px) and (max-width: 1160px) {
  .cardRow {
    flex-direction: column;
    align-items: center;
  }
  .Titles {
    font-size: 32px; /* Adjust font size for medium screens */
  }
  .mt-6 {
    margin-top: 40px; /* Adjust margin for medium screens */
  }
}

@media (min-width: 1160px) {
  .Titles {
    font-size: 38px; /* Adjust font size for larger screens */
  }
  .mt-6 {
    margin-top: 50px; /* Adjust margin for larger screens */
  }
}
</style>
