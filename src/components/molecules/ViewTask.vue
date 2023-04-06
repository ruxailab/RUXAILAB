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
        <v-row justify="center">
          <v-btn v-if="item.hasTimer === true" color="success">
            <v-icon left>
              mdi-timer
            </v-icon>Timer
          </v-btn>
        </v-row>
        <v-spacer />
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
  methods: {
    updated() {
      this.$emit("updatedAnswer", this.item)
    },
  },
}
</script>

<style scoped>

.full-content{
  height: 100%;
  width: 100%;
}

</style>
