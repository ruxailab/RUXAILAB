<template>
  <v-card>
    <v-row justify="center">
      <v-card-title class="Title">
        <v-icon left>
          mdi-volume-high
        </v-icon>Audio Record
      </v-card-title>
    </v-row>
    <v-row justify="center">
      <v-btn v-if="!isRunningAudio" color="green" @click="startAudioRecording">
        <v-icon> mdi-microphone </v-icon>
      </v-btn>
      <v-btn v-if="isRunningAudio" color="blue" @click="stopAudioRecording">
        <v-icon> mdi-microphone-off </v-icon>
      </v-btn>
      <v-btn color="red">
        <v-icon> mdi-replay </v-icon>
      </v-btn>
    </v-row>
    <br>
    <v-col>
      <audio controls />
    </v-col>
  </v-card>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
      default: function() {
        return {
          taskName: "",
          taskTip: ""
        }
      }
    }
  },
  data: () => ({
    dialog: false,
    audioRecorder: {
      start: false,
      stop: false,
      cancel: false
    },
    isRunningAudio: false,
    audioBlobs: [],
    mediaRecorder: null,
    streamBeingCaptured: null,
  }),
  methods: {
    async start() {
      //Feature Detection
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        //Feature is not supported in browser
        //return a custom error
        return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'))
      }
      else {
        this.isRunningAudio = true
        //Feature is supported in browser

        //create an audio stream
        return navigator.mediaDevices.getUserMedia({ audio: true }/*of type MediaStreamConstraints*/)
          //returns a promise that resolves to the audio stream
          .then((stream) /*of type MediaStream*/ => {
            streamBeingCaptured = stream
            mediaRecorder = new MediaRecorder(stream)
            audioBlobs = []  //save
            mediaRecorder.addEventListener("dataavailable", event => {
              //store audio Blob object
              audioBlobs.push(event.data)
            })
            mediaRecorder.start()

          })
      }
    },
    stop() {
      return new Promise(resolve => {
        //save audio type to pass to set the Blob type
        const mimeType = mediaRecorder.mimeType

        //listen to the stop event in order to create & return a single Blob object
        mediaRecorder.addEventListener("stop", () => {
          //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
          const audioBlob = new Blob(audioBlobs, { type: mimeType })

          //resolve promise with the single audio blob representing the recorded audio
          resolve(audioBlob)
        })

        //stop the recording feature
        mediaRecorder.stop()

        //stop all the tracks on the active stream in order to stop the stream
        stopStream()

        //reset API properties for next recording
        resetRecordingProperties()

        this.isRunningAudio = false

      })

    },
    stopStream() {
      streamBeingCaptured.getTracks()
      .forEach(track /*of type MediaStreamTrack*/ => track.stop())
    },
    resetRecordingProperties() {
      mediaRecorder = null
      streamBeingCaptured = null
    },
    cancel() {

    },

    //-------------------------------
    startAudioRecording() {
      this.start()
      //start recording using the audio recording API
      if (this.isRunningAudio) {
        alert("Recording Audio")
        console.log("Recording Audio...")
      }
      else {
        alert("mediaDevices API or getUserMedia method is not supported in this browser.")
        console.log("To record audio, use browsers like Chrome and Firefox.")
      }
    },
    stopAudioRecording() {
      alert("Stopping Audio Recording")
      this.stop()
      if (!this.isRunningAudio) {

      }
      else {
        console.log("Error to stop audio")
      }

    },

  }
}
</script>

<style>
  .Title {
  font-family: Roboto;
  font-style: normal;
  font-weight: 200;
  color: #000000;
}

</style>
