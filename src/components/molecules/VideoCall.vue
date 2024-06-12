<template>
  <v-container fluid>
    <v-row class="mb-2" justify="center">
      <v-col cols="10">
        <v-btn
          v-if="index == 0"
          :disabled="!consentCompleted && !isAdmin"
          :dark="(consentCompleted && !isAdmin) || isAdmin"
          @click="openUserCamera(), openUserScreen()"
          color="green"
          block
          depressed
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
              'stun:stun3.l.google.com:19302',
              'stun:stun4.l.google.com:19302',
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
    localScreenStream() {
      return this.$store.getters.localScreenStream
    },
    remoteScreenStream() {
      return this.$store.getters.remoteScreenStream
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
  methods: {
    emitConfirm() {
      this.$emit('emit-confirm')
    },

    async createRoom() {
      // Inicialização e configuração
      this.createBtnDisabled = true
      this.joinBtnDisabled = true
      this.roomCollection = collection(db, 'rooms')
      const roomRef = doc(this.roomCollection, this.roomTestId)
      this.peerConnection = new RTCPeerConnection(this.configuration)

      // Adição das tracks da câmera
      this.localCameraStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localCameraStream)
      })

      // Configuração do ICE
      const callerCandidatesCollection = collection(roomRef, 'callerCandidates')
      this.peerConnection.addEventListener('icecandidate', (event) => {
        if (!event.candidate) {
          return
        }
        addDoc(callerCandidatesCollection, event.candidate.toJSON())
      })

      // Criação da oferta e configuração
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
        console.log('Track received in CreateRoom:', event.track) // por enquanto so estou conseguindo logar o da camera, tenho que revisar mais o codigo
        event.streams[0].getTracks().forEach((track) => {
          this.remoteCameraStream.addTrack(track)
        })
      })

      // Observação das mudanças na sala
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

    async joinRoomById(roomId, streamType) {
      // Inicialização e configuração
      const roomRef = doc(collection(db, 'rooms'), roomId)
      const roomSnapshot = await getDoc(roomRef)

      if (roomSnapshot.exists) {
        this.peerConnection = new RTCPeerConnection(this.configuration)

        // Adição das tracks com base no tipo de stream
        if (streamType === 'camera') {
          this.localCameraStream.getTracks().forEach((track) => {
            track.contentHint = 'camera'
            this.peerConnection.addTrack(track, this.localCameraStream)
          })
        } else if (streamType === 'screen') {
          this.localScreenStream.getTracks().forEach((track) => {
            track.contentHint = 'screen'
            this.peerConnection.addTrack(track, this.localScreenStream)
          })
        }

        // Configuração do ICE
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

        // Recebimento das tracks remotas
        this.peerConnection.addEventListener('track', (event) => {
          console.log('Track received in JoinWithId:', event.track)
          event.streams[0].getTracks().forEach((track) => {
            this.remoteCameraStream.addTrack(track)
          })
        })

        // Configuração da resposta
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
              const data = change.doc.data()
              await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(data),
              )
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
        }
      } catch (e) {
        this.$toast.error('Error in capturing your media device:' + e.message)
      }
      if (this.isAdmin) {
        this.createRoom()
      } else if (!this.isAdmin) {
        this.joinRoomById(this.roomTestId, 'camera')
      }
    },

    async openUserScreen() {
      if (this.isAdmin) {
        this.emitConfirm()
        this.$store.commit('SET_REMOTE_SCREEN_STREAM', new MediaStream())
        this.createBtnDisabled = false
        this.joinBtnDisabled = false
        this.hangupBtnDisabled = false
      }
      if (!this.isAdmin) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          })
          if (stream) {
            this.emitConfirm()
            this.$store.commit('SET_LOCAL_SCREEN_STREAM', stream)
            this.createBtnDisabled = false
            this.joinBtnDisabled = false
            this.hangupBtnDisabled = false
            this.joinRoomById(this.roomTestId, 'screen')
          }
        } catch (e) {
          this.$toast.error('Error in capturing your media device:' + e.message)
        }
      }
    },

    async hangUp() {
      const tracks = this.localCameraStream.getTracks()
      tracks.forEach((track) => {
        track.stop()
      })

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

          // Verificando se o documento da sala existe antes de tentar excluí-lo
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
          } else {
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
