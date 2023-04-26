<template>
  <v-container>
    <div class="full-content" align="center" justify="center">
      <v-col>
        <v-row justify="center">
          <h1>{{ item.taskName }}</h1>
        </v-row>
        <v-spacer />
        <v-row v-if="item.taskTip !== null" justify="end">
          <TipButton :task="item" />
        </v-row>
        <v-spacer />
        <v-row justify="center">
          <p class="paragraph">
            {{ item.taskDescription }}
          </p>
        </v-row>
        <v-spacer />
        <!-- Criar link para hasPost aqui com v-if -->
        <!-------------- Timer -------------->

        <v-card v-if="item.hasTimer === true">
          <v-row justify="center">
            <v-col>
              <v-card-title class="Title">
                <v-icon left>
                  mdi-timer
                </v-icon>Timer
              </v-card-title>
            </v-col>
            <v-col>
              <v-row justify="center">
                {{ prettyTime }}
              </v-row>
              <v-btn v-if="!isRunningTimer" color="green" @click="start">
                Start
              </v-btn>
              <v-btn v-if="isRunningTimer" color="blue" @click="stop">
                Stop
              </v-btn>
              <v-btn color="red" @click="reset">
                Reset
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-spacer />
        <!----------------------------------->
        <br>
        <v-spacer />
        <v-row v-if="item.hasAudioRecord === true" justify="center">
          <AudioButton :task="item" />
        </v-row>
        <br>
        <v-row v-if="item.hasCamRecord === true" justify="center">
          <CameraButton :task="item" />
        </v-row>
        <br>
        <!-- <v-row v-if="item.hasEye === true" justify="center">
          <EyeButton :task="item" />
        </v-row> -->
        <br>
        <v-row v-if="item.hasScreenRecord === true" justify="center">
          <ScreenButton :task="item" />
        </v-row>


        <!-- <v-row justify="center">
          <v-col>
            <v-btn v-if="item.hasEye === true" color="purple">
              <v-icon left>
                mdi-eye
              </v-icon>Eye Tracker
            </v-btn>
          </v-col>
          <v-row v-if="item.hasScreenRecord === true" justify="center">
            <ScreenButton :task="item" />
          </v-row>
        </v-row> -->
        <v-spacer />
        <br>
        <v-spacer />
        <!-- <v-row v-if="item.hasAudioRecord === true" justify="center">
          <AudioButton :task="item" />
        </v-row> -->
        <br>

        <v-spacer />

        <v-row class="paragraph" justify="space-around">
          <v-col v-if="item.taskType === 'textArea'">
            <v-textarea
              :id="'id-'+item.taskName"
              v-model="item.res"
              outlined
              label="answer"
              @change="updated"
            />
          </v-col>
          <v-col>
            <v-textarea
              :id="'id-'+item.taskName"
              v-model="item.obs"
              outlined
              label="observation (optional)"
              @change="updated"
            />
          </v-col>
        </v-row>



        <!-- --------------------------------------------------------------- -->
        <v-row class="nav pa-0 ma-0" dense>
          <v-speed-dial
            v-model="fab"
            fixed
            class="mr-3"
            bottom
            right
            open-on-hover
            :transition="transition"
          >
            <template v-slot:activator>
              <v-btn
                slot="activator"
                v-model="fab"
                large color="#F9A826"
                dark fab class="btn-fix"
              >
                <v-icon v-if="fab">
                  mdi-close
                </v-icon>
                <v-icon v-else large>
                  mdi-hammer-screwdriver
                </v-icon>
              </v-btn>
            </template>
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <v-btn
                  slot="activator"
                  color="#F9A826"
                  dark fab class="btn-fix"
                  @click="saveAnswer()"
                  v-on="on"
                >
                  <v-icon>mdi-content-save</v-icon>
                </v-btn>
              </template>
              <span>Save</span>
            </v-tooltip>
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <v-btn
                  slot="activator"
                  color="#F9A826"
                  dark fab class="btn-fix"
                  @click="submitAnswer()"
                  v-on="on"
                >
                  <v-icon>mdi-file-move</v-icon>
                </v-btn>
              </template>
              <span>Submit</span>
            </v-tooltip>
          </v-speed-dial>
        </v-row>




        <!-- <v-row v-else class="fill-height" align="center" justify="center">
      <iframe
        :src="item.postTest"
        width="100%"
        height="900"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
      >Carregando…</iframe>
    </v-row> -->
      </v-col>
    </div>
  </v-container>
</template>

<script>
import TipButton from "../atoms/TipButton"
import AudioButton from "../atoms/AudioButton"
import CameraButton from "../atoms/CameraButton"
import ScreenButton from "../atoms/ScreenButton"
// import EyeButton from "../atoms/EyeButton"

export default {
  components: {
    TipButton,
    AudioButton,
    CameraButton,
    ScreenButton,
    // EyeButton
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    // postTest: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  data: () => ({
    //Timer
    isRunningTimer: false,
    minutes: 0,
    seconds: 0,
    time: 0,
    timer: null,

    //Save button
    fab: false,
    transition: 'slide-y-reverse-transition',
  }),
  computed: {
		prettyTime () {
			 const time = this.time / 60
			 const minutes = parseInt(time)
			 const seconds = Math.round((time - minutes) * 60)
			 return minutes+":"+seconds
    },
    allAnswer() {
      return {

      }
    },
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer
    },
    test() {
      return this.$store.getters.test
    },
  },
  watch: {
    async created() {
      await this.$store.dispatch("getTest", { id: this.id })
      await this.$store.dispatch("getCurrentTestAnswerDoc").then((res) => {
        console.log(res)
      })
      // this.populateWithHeuristicQuestions()
      // this.calculateProgress()
    },
  },

  methods: {
    updated() {
      this.$emit("updatedAnswer", this.item)
    },
    start() {
      this.isRunningTimer = true
      if (!this.timer) {
        this.timer = setInterval(() => {

            this.time++
          
        }, 1000)
      }
    },
    stop() {
      this.isRunningTimer = false
      clearInterval(this.timer)
      this.timer = null
    },
    reset() {
      this.stop()
      this.time = 0
      this.seconds = 0
      this.minutes = 0
    },
    saveAnswer() {
      console.log("SaveAnswer")
      this.$store.dispatch("getCurrentTestAnswerDoc").then((res) => {
        console.log(res)
      })
      console.log(this.currentUserTestAnswer)
      //this.currentUserTestAnswer.progress = this.calculatedProgress
      this.$store.dispatch("saveTestAnswer", {
        data: this.currentUserTestAnswer,
        answerDocId: this.test.answersDocId,
      })
    },
    submitAnswer() {
      this.currentUserTestAnswer.submitted = true
      this.saveAnswer()
    },

  },

}
</script>

<style scoped>

.full-content{
  height: 100%;
  width: 100%;
}

.Title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  color: #000000;
}

</style>
