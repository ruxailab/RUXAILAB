<template>
  <v-container fluid>
    <v-row class="ma-4" justify="center">
      <v-btn class="mr-4" color="primary" @click="openUserMedia()">
        <v-icon left>mdi-camera</v-icon>
        Open camera & microphone
      </v-btn>
      <v-btn
        class="mr-4"
        color="primary"
        :disabled="createBtnDisabled"
        @click="createRoom()"
      >
        <v-icon left>mdi-account-group-outline</v-icon>
        Create room
      </v-btn>
      <v-btn
        class="mr-4"
        color="primary"
        :disabled="joinBtnDisabled"
        @click="joinRoom()"
      >
        <v-icon left>mdi-account-group</v-icon>
        Join room
      </v-btn>
      <v-btn color="primary" :disabled="hangupBtnDisabled" @click="hangUp()">
        <v-icon left>mdi-close</v-icon>
        Hangup
      </v-btn>
    </v-row>

    <v-row justify="center" class="mt-4">
      <span id="currentRoom">{{ currentRoom }}</span>
    </v-row>

    <v-row justify="center">
      <v-col cols="6">
        <v-row justify="center">
          <video id="localVideo" muted autoplay playsinline></video>
        </v-row>
        <v-row justify="center">
          <video id="remoteVideo" autoplay playsinline></video>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="roomDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>Join room</v-card-title>
        <v-card-text>
          Enter ID for room to join:
          <v-text-field v-model="roomId" label="Room ID"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="roomDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" @click="confirmJoin">Join</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { collection, doc, addDoc, setDoc, onSnapshot, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
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
      localStream: null,
      remoteStream: null,
      roomDialog: false,
      roomCollection: null, // Adicionando a referência para a coleção do Firestore
    }
  },
  methods: {
    async createRoom() {
      this.createBtnDisabled = true
      this.joinBtnDisabled = true
      this.roomCollection = collection(db, 'rooms') // Obtendo a referência da coleção

      const roomRef = doc(this.roomCollection) // Criando uma nova referência para um documento na coleção

      console.log(
        'Create PeerConnection with configuration: ',
        this.configuration,
      )
      this.peerConnection = new RTCPeerConnection(this.configuration)

      this.registerPeerConnectionListeners()

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream)
      })

      // Adicione o código para criar uma sala aqui

      // Código para criar a sala acima

      // Código para coletar candidatos ICE abaixo
      const callerCandidatesCollection = collection(roomRef, 'callerCandidates')

      this.peerConnection.addEventListener('icecandidate', (event) => {
        if (!event.candidate) {
          console.log('Got final candidate!')
          return
        }
        console.log('Got candidate: ', event.candidate)
        addDoc(callerCandidatesCollection, event.candidate.toJSON()) // Adicionando candidato à coleção
      })
      // Código para coletar candidatos ICE acima

      // Código para criar uma sala abaixo
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      console.log('Created offer:', offer)

      const roomWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      }
      await setDoc(roomRef, roomWithOffer) // Definindo os detalhes da sala no documento
      this.roomId = roomRef.id
      console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`)
      this.currentRoom = `Current room is ${roomRef.id} - You are the caller!`
      // Código para criar uma sala acima

      this.peerConnection.addEventListener('track', (event) => {
        console.log('Got remote track:', event.streams[0])
        event.streams[0].getTracks().forEach((track) => {
          console.log('Add a track to the remoteStream:', track)
          this.remoteStream.addTrack(track)
        })
      })

      // Escutando a descrição da sessão remota abaixo
      onSnapshot(roomRef, async (snapshot) => {
        const data = snapshot.data()
        if (
          !this.peerConnection.currentRemoteDescription &&
          data &&
          data.answer
        ) {
          console.log('Got remote description: ', data.answer)
          const rtcSessionDescription = new RTCSessionDescription(data.answer)
          await this.peerConnection.setRemoteDescription(rtcSessionDescription)
        }
      })
      // Escutando a descrição da sessão remota acima

      // Escutando candidatos ICE remotos abaixo
      onSnapshot(collection(roomRef, 'calleeCandidates'), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            let data = change.doc.data()
            console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
      // Escutando candidatos ICE remotos acima
    },
    async joinRoom() {
      this.createBtnDisabled = true
      this.joinBtnDisabled = true
      this.roomDialog = true
    },
    async confirmJoin() {
      const roomId = this.roomId
      console.log('Join room: ', roomId)
      this.currentRoom = `Current room is ${roomId} - You are the callee!`
      await this.joinRoomById(roomId)
    },
    async joinRoomById(roomId) {
      const roomRef = doc(collection(db, 'rooms'), roomId) // Obtendo uma referência para o documento da sala

      const roomSnapshot = await getDoc(roomRef) // Obtendo os detalhes da sala

      console.log('Got room:', roomSnapshot.exists)

      if (roomSnapshot.exists) {
        console.log(
          'Create PeerConnection with configuration: ',
          this.configuration,
        )
        this.peerConnection = new RTCPeerConnection(this.configuration)
        this.registerPeerConnectionListeners()
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream)
        })

        // Código para coletar candidatos ICE abaixo
        const calleeCandidatesCollection = collection(
          roomRef,
          'calleeCandidates',
        )
        this.peerConnection.addEventListener('icecandidate', (event) => {
          if (!event.candidate) {
            console.log('Got final candidate!')
            return
          }
          console.log('Got candidate: ', event.candidate)
          addDoc(calleeCandidatesCollection, event.candidate.toJSON())
        })
        // Código para coletar candidatos ICE acima

        this.peerConnection.addEventListener('track', (event) => {
          console.log('Got remote track:', event.streams[0])
          event.streams[0].getTracks().forEach((track) => {
            console.log('Add a track to the remoteStream:', track)
            this.remoteStream.addTrack(track)
          })
        })

        // Código para criar a resposta SDP abaixo
        const offer = roomSnapshot.data().offer
        console.log('Got offer:', offer)
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        )
        const answer = await this.peerConnection.createAnswer()
        console.log('Created answer:', answer)
        await this.peerConnection.setLocalDescription(answer)

        const roomWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        }
        await updateDoc(roomRef, roomWithAnswer) // Atualizando os detalhes da sala com a resposta SDP
        // Código para criar a resposta SDP acima

        // Escutando candidatos ICE remotos abaixo
        onSnapshot(collection(roomRef, 'callerCandidates'), (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              let data = change.doc.data()
              console.log(
                `Got new remote ICE candidate: ${JSON.stringify(data)}`,
              )
              await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(data),
              )
            }
          })
        })
        // Escutando candidatos ICE remotos acima
      }
    },
    async openUserMedia() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      this.localStream = stream
      this.remoteStream = new MediaStream()
      document.querySelector('#localVideo').srcObject = this.localStream
      document.querySelector('#remoteVideo').srcObject = this.remoteStream
      this.createBtnDisabled = false
      this.joinBtnDisabled = false
      this.hangupBtnDisabled = false
    },
    async hangUp() {
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

      document.querySelector('#localVideo').srcObject = null
      document.querySelector('#remoteVideo').srcObject = null
      this.localStream = null
      this.remoteStream = null
      this.roomId = null
      this.createBtnDisabled = false
      this.joinBtnDisabled = false
      this.hangupBtnDisabled = true
      this.currentRoom = ''

      // Excluindo a sala ao desligar
      if (this.roomId) {

        const roomRef = doc(collection(db, 'rooms'), this.roomId)
        const calleeCandidates = await collection(roomRef, 'calleeCandidates').get()
        calleeCandidates.forEach(async (candidate) => {
          await deleteDoc(candidate.ref)
        })
        const callerCandidates = await collection(roomRef, 'callerCandidates').get()
        callerCandidates.forEach(async (candidate) => {
          await deleteDoc(candidate.ref)
        })
        await deleteDoc(roomRef)
      }

      document.location.reload(true)
    },
    registerPeerConnectionListeners() {
      this.peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
          `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`,
        )
      })

      this.peerConnection.addEventListener('connectionstatechange', () => {
        console.log(
          `Connection state change: ${this.peerConnection.connectionState}`,
        )
      })

      this.peerConnection.addEventListener('signalingstatechange', () => {
        console.log(
          `Signaling state change: ${this.peerConnection.signalingState}`,
        )
      })

      this.peerConnection.addEventListener('iceconnectionstatechange', () => {
        console.log(
          `ICE connection state change: ${this.peerConnection.iceConnectionState}`,
        )
      })
    },
  },
}
</script>

<style scoped>
/* Estilos Vue.js aqui */
</style>
