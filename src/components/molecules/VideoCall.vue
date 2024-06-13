<template>
  <v-container fluid>
    <v-row class="mb-2" justify="center">
      <v-col cols="10">
        <v-btn
          v-if="index === 0"
          :disabled="!consentCompleted && !isAdmin"
          :dark="(consentCompleted && !isAdmin) || isAdmin"
          @click="openUserCamera"
          color="green"
          block
          depressed
          >CONNECT</v-btn
        >
        <v-btn
          v-if="index === 1"
          @click="toggleCameraScreen"
          color="blue"
          block
          depressed
          >TOGGLE CAMERA/SCREEN</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  data() {
    return {
      createBtnDisabled: false,
      joinBtnDisabled: false,
      hangupBtnDisabled: true,
      roomId: null,
      currentRoom: '',
      configuration: {
        iceServers: [
          {
            urls: [
              'stun:stun1.l.google.com:19302',
              'stun:stun2.l.google.com:19302',
              'stun:stun3.l.google.com:19302',
              'stun:stun4.l.google.com:19302',
            ],
          },
        ],
        iceCandidatePoolSize: 10,
      },
      peerConnection: null,
      videoSender: null, // Initialize videoSender as null
      roomDialog: false,
      roomCollection: null,
      usingCamera: true,
    }
  },
  beforeRouteLeave() {
    this.hangUp()
  },
  props: {
    isAdmin: {
      type: Boolean,
    },
    index: {
      type: Number,
    },
    consentCompleted: {
      type: Boolean,
    },
  },
  computed: {
    localCameraStream() {
      return this.$store.getters.localCameraStream
    },
    remoteCameraStream() {
      return this.$store.getters.remoteCameraStream
    },
    roomTestAnswerId() {
      return this.$store.getters.test.testAnswerId
    },
    roomTestId() {
      return this.$store.getters.test.id
    },
    currentUserTestAnswer() {
      return this.$store.getters.currentUserTestAnswer
    },
  },
  created() {
    if (!this.isAdmin) {
      setInterval(this.toggleCameraScreen, 50000) // Remove parentheses from toggleCameraScreen
    }
  },
  methods: {
    emitConfirm() {
      this.$emit('emit-confirm')
    },

    async createRoom() {
      this.createBtnDisabled = true
      this.joinBtnDisabled = true
      this.roomCollection = collection(db, 'rooms')
      const roomRef = doc(this.roomCollection, this.roomTestId)
      this.peerConnection = new RTCPeerConnection(this.configuration)

      this.localCameraStream.getTracks().forEach((track) => {
        this.videoSender = this.peerConnection.addTrack(
          track,
          this.localCameraStream,
        )
      })

      const callerCandidatesCollection = collection(roomRef, 'callerCandidates')
      this.peerConnection.addEventListener('icecandidate', (event) => {
        if (!event.candidate) {
          return
        }
        addDoc(callerCandidatesCollection, event.candidate.toJSON())
      })

      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      const roomWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      }
      await setDoc(roomRef, roomWithOffer)
      this.roomId = roomRef.id
      this.currentRoom = `Current room is ${roomRef.id} - You are the caller!`

      this.peerConnection.addEventListener('track', (event) => {
        console.log('Track received in CreateRoom:', event.track)
        event.streams[0].getTracks().forEach((track) => {
          this.remoteCameraStream.addTrack(track)
        })
      })

      onSnapshot(roomRef, async (snapshot) => {
        const data = snapshot.data()
        if (
          !this.peerConnection.currentRemoteDescription &&
          data &&
          data.answer
        ) {
          const rtcSessionDescription = new RTCSessionDescription(data.answer)
          await this.peerConnection.setRemoteDescription(rtcSessionDescription)
        }
      })

      onSnapshot(collection(roomRef, 'calleeCandidates'), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data()
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
    },

    async joinRoomById(roomId) {
      console.log(`Joining room: ${roomId}`)
      const roomRef = doc(collection(db, 'rooms'), roomId)
      const roomSnapshot = await getDoc(roomRef)

      if (roomSnapshot.exists) {
        this.peerConnection = new RTCPeerConnection(this.configuration)
        const localStream = this.localCameraStream
        localStream.getTracks().forEach((track) => {
          this.videoSender = this.peerConnection.addTrack(track, localStream)
          console.log(`Added track to peerConnection: ${track.id}`)
        })

        const calleeCandidatesCollection = collection(
          roomRef,
          'calleeCandidates',
        )
        this.peerConnection.addEventListener('icecandidate', (event) => {
          if (!event.candidate) {
            return
          }
          addDoc(calleeCandidatesCollection, event.candidate.toJSON())
          console.log('Added ICE candidate:', event.candidate)
        })

        this.peerConnection.addEventListener('track', (event) => {
          console.log('Track received in JoinWithId:', event.track)
          event.streams[0].getTracks().forEach((track) => {
            if (this.remoteCameraStream) {
              this.remoteCameraStream.addTrack(track)
            }
          })
        })

        const offer = roomSnapshot.data().offer
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        )
        console.log('Set remote description with offer:', offer)

        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        console.log('Created and set local description with answer:', answer)

        const roomWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        }
        await updateDoc(roomRef, roomWithAnswer)

        onSnapshot(collection(roomRef, 'callerCandidates'), (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data()
              await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(data),
              )
              console.log('Added remote ICE candidate:', data)
            }
          })
        })
      }
    },

    async openUserCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        if (stream) {
          this.emitConfirm()
          this.$store.commit('SET_LOCAL_STREAM', stream)
          this.$store.commit('SET_REMOTE_STREAM', new MediaStream())
          this.createBtnDisabled = false
          this.joinBtnDisabled = false
          this.hangupBtnDisabled = false

          if (this.isAdmin) {
            this.createRoom()
          } else {
            this.joinRoomById(this.roomTestId)
          }
        }
      } catch (e) {
        this.$toast.error('Error in capturing your media device:' + e.message)
      }
    },

    async toggleCameraScreen() {
      try {
        let stream

        // Toggle between camera and screen sharing
        if (this.usingCamera) {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          })
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          })
        }

        if (stream) {
          const newTrack = stream.getVideoTracks()[0]

          // Check if videoSender is defined and replace the track
          if (this.videoSender) {
            await this.videoSender.replaceTrack(newTrack)
          } else {
            console.error('videoSender is not set')
          }

          // Update local stream and toggle camera/screen flag
          this.$store.commit('SET_LOCAL_STREAM', stream)
          this.usingCamera = !this.usingCamera
        }
      } catch (e) {
        this.$toast.error('Error in toggling camera/screen: ' + e.message)
      }
    },

    async hangUp() {
      const tracks = this.localCameraStream.getTracks()
      tracks.forEach((track) => track.stop())

      if (this.remoteCameraStream) {
        this.remoteCameraStream.getTracks().forEach((track) => track.stop())
      }

      if (this.peerConnection) {
        this.peerConnection.close()
      }

      this.$store.commit('SET_LOCAL_STREAM', null)
      this.$store.commit('SET_REMOTE_STREAM', null)
      this.createBtnDisabled = false
      this.joinBtnDisabled = false
      this.hangupBtnDisabled = true
      this.currentRoom = ''

      // Deleting room on hang up
      if (this.roomId) {
        try {
          const roomRef = doc(db, 'rooms', this.roomId)

          // Check if the room document exists before trying to delete it
          const roomSnapshot = await getDoc(roomRef)
          if (roomSnapshot.exists()) {
            const calleeCandidatesSnapshot = await getDocs(
              collection(roomRef, 'calleeCandidates'),
            )
            calleeCandidatesSnapshot.forEach(async (candidate) => {
              await deleteDoc(candidate.ref)
            })

            const callerCandidatesSnapshot = await getDocs(
              collection(roomRef, 'callerCandidates'),
            )
            callerCandidatesSnapshot.forEach(async (candidate) => {
              await deleteDoc(candidate.ref)
            })

            await deleteDoc(roomRef)
          }
        } catch (error) {
          console.error('Error deleting room and candidates:', error)
        }
      }
    },
  },
}
</script>

<style scoped></style>
