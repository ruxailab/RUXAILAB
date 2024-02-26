<template>
  <v-container fluid>
    <v-row class="mb-2" justify="center">
      <v-col cols="10">
        <v-btn
          v-if="index == 0"
          @click="openUserMedia(), emitConfirm()"
          color="green"
          block
          depressed
          dark
          >CONNECT</v-btn
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
            ],
          },
        ],
        iceCandidatePoolSize: 10,
      },
      peerConnection: null,
      roomDialog: false,
      roomCollection: null,
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
  },
  computed: {
    localStream() {
      return this.$store.getters.localStream
    },
    remoteStream() {
      return this.$store.getters.remoteStream
    },
    roomTestAnswerId() {
      return this.$store.getters.test.testAnswerId
    },
    roomTestId() {
      return this.$store.getters.test.id
    },
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

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream)
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
      await setDoc(roomRef, roomWithOffer) // Setting room details in document
      this.roomId = roomRef.id
      this.currentRoom = `Current room is ${roomRef.id} - You are the caller!`

      this.peerConnection.addEventListener('track', (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream.addTrack(track)
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
            let data = change.doc.data()
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
    },
    async joinRoom() {
      this.createBtnDisabled = true
      this.joinBtnDisabled = true
      this.roomDialog = true
    },
    async confirmJoin() {
      const roomId = this.roomId
      this.currentRoom = `Current room is ${roomId} - You are the callee!`
      await this.joinRoomById(roomId)
    },
    async joinRoomById(roomId) {
      const roomRef = doc(collection(db, 'rooms'), roomId)

      const roomSnapshot = await getDoc(roomRef)

      console.log('Got room:', roomSnapshot.exists)

      if (roomSnapshot.exists) {
        this.peerConnection = new RTCPeerConnection(this.configuration)

        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream)
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
        })

        this.peerConnection.addEventListener('track', (event) => {
          event.streams[0].getTracks().forEach((track) => {
            this.remoteStream.addTrack(track)
          })
        })

        const offer = roomSnapshot.data().offer
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        )
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)

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
              let data = change.doc.data()
              await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(data),
              )
            }
          })
        })
      }
    },
    async switchMediaStream() {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          cursor: true,
        })
        const screenTrack = stream.getTracks()[0]

        // Get all the tracks that are currently being sent
        const senders = this.peerConnection.getSenders()

        // Replace each track with the new screenTrack
        senders.forEach((sender) => {
          if (sender.track.kind === 'video') {
            sender.replaceTrack(screenTrack)
          }
        })

        // When screen sharing is stopped, replace the screenTrack with the original tracks
        screenTrack.onended = () => {
          senders.forEach((sender) => {
            if (sender.track.kind === 'video') {
              const originalTrack = this.localStream.getVideoTracks()[0]
              sender.replaceTrack(originalTrack)
            }
          })
        }

        this.$store.commit('SET_LOCAL_STREAM', stream)
      } catch (error) {
        console.error('Error switching media stream:', error)
      }
    },

    async openUserMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        this.$store.commit('SET_LOCAL_STREAM', stream)
        this.$store.commit('SET_REMOTE_STREAM', new MediaStream())
        this.createBtnDisabled = false
        this.joinBtnDisabled = false
        this.hangupBtnDisabled = false
      } catch (e) {
        alert('Error in capturing your media device: ' + e.message)
      }
      if (this.isAdmin) {
        this.createRoom() // calling createRoom function to before connect the webcam the moderator instantly create a room
      } else if (!this.isAdmin) {
        this.joinRoomById(this.roomTestId)
      }
    },
    async hangUp() {
      console.log('hang up')
      const tracks = this.localStream.getTracks()
      tracks.forEach((track) => {
        track.stop()
      })

      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach((track) => track.stop())
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

          // Verificando se o documento da sala existe antes de tentar excluí-lo
          const roomSnapshot = await getDoc(roomRef)
          if (roomSnapshot.exists()) {
            console.log('Room document exists. Deleting...')

            const calleeCandidatesSnapshot = await getDocs(
              collection(roomRef, 'calleeCandidates'),
            )
            calleeCandidatesSnapshot.forEach(async (candidate) => {
              await deleteDoc(candidate.ref)
              console.log('Deleted callee candidate:', candidate.id)
            })

            const callerCandidatesSnapshot = await getDocs(
              collection(roomRef, 'callerCandidates'),
            )
            callerCandidatesSnapshot.forEach(async (candidate) => {
              await deleteDoc(candidate.ref)
              console.log('Deleted caller candidate:', candidate.id)
            })

            await deleteDoc(roomRef)
            console.log('Deleted room document:', this.roomId)
          } else {
            console.log('Room document does not exist.')
          }
        } catch (error) {
          console.error('Error deleting room and candidates:', error)
        }
      }
      // document.location.reload(true)
    },
  },
}
</script>

<style scoped></style>
