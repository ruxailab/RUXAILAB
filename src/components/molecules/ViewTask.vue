<template>
  <v-container>
    <v-row class="full-content" align="center" justify="center">
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
              <v-btn v-if="!isRunning" color="green" @click="start">
                Start
              </v-btn>
              <v-btn v-if="isRunning" color="blue" @click="stop">
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
        <v-row justify="center">
          <v-col>
            <v-btn v-if="item.hasEye === true" color="purple">
              <v-icon left>
                mdi-eye
              </v-icon>Eye Tracker
            </v-btn>
          </v-col>
          <v-col>
            <v-btn v-if="item.hasScreenRecord === true" color="red">
              <v-icon left>
                mdi-laptop
              </v-icon>Screen Record
            </v-btn>
          </v-col>
        </v-row>
        <v-spacer />
        <br>
        <v-spacer />
        <v-row justify="center">
          <v-col>
            <v-btn v-if="item.hasAudioRecord === true" color="#f2a9be">
              <v-icon left>
                mdi-volume-high
              </v-icon>Audio Record
            </v-btn>
          </v-col>
          <v-col>
            <v-btn v-if="item.hasCamRecord === true" color="blue">
              <v-icon left>
                mdi-camera
              </v-icon>Camera Record
            </v-btn>
          </v-col>
        </v-row>
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
    </v-row>
  </v-container>
</template>

<script>
import TipButton from "../atoms/TipButton"
export default {
  components: {
    TipButton,
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
    isRunning: false,
    minutes: 0,
    seconds: 0,
    time: 0,
    timer: null,
  }),
  computed: {
		prettyTime () {
			 const time = this.time / 60
			 const minutes = parseInt(time)
			 const seconds = Math.round((time - minutes) * 60)
			 return minutes+":"+seconds
		}
	},

  methods: {
    updated() {
      this.$emit("updatedAnswer", this.item)
    },
    start() {
      this.isRunning = true
      if (!this.timer) {
        this.timer = setInterval(() => {
          if (this.time < 60) {
            this.time++
          } else {
            alert("Timeout reached!")
            this.stop()
          }
        }, 1000)
      }
    },
    stop() {
      this.isRunning = false
      clearInterval(this.timer)
      this.timer = null
    },
    reset() {
      this.stop()
      this.time = 0
      this.seconds = 0
      this.minutes = 0
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
