<template>
  <v-container fluid>
    <h1>Welcome to JucaRTC!</h1>
    <v-row justify="center">
      <v-btn class="mr-4" color="primary" @click="openUserMedia()">
        <v-icon left>mdi-camera</v-icon>
        Open camera & microphone
      </v-btn>
      <v-btn class="mr-4" color="primary" :disabled="createBtnDisabled" @click="createRoom()">
        <v-icon left>mdi-account-group-outline</v-icon>
        Create room
      </v-btn>
      <v-btn class="mr-4" color="primary" :disabled="joinBtnDisabled" @click="joinRoom()">
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
          <v-btn color="blue darken-1" text @click="roomDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" @click="confirmJoin">Join</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/firestore';

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
      roomDialog: null,
    };
  },
  methods: {
    async createRoom() {
      this.createBtnDisabled = true;
      this.joinBtnDisabled = true;
      const db = firebase.firestore();
      const roomRef = await db.collection('rooms').doc();

      console.log('Create PeerConnection with configuration: ', this.configuration);
      this.peerConnection = new RTCPeerConnection(this.configuration);

      this.registerPeerConnectionListeners();

      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Add code for creating a room here

      // Code for creating room above

      // Code for collecting ICE candidates below
      const callerCandidatesCollection = roomRef.collection('callerCandidates');

      this.peerConnection.addEventListener('icecandidate', event => {
        if (!event.candidate) {
          console.log('Got final candidate!');
          return;
        }
        console.log('Got candidate: ', event.candidate);
        callerCandidatesCollection.add(event.candidate.toJSON());
      });
      // Code for collecting ICE candidates above

      // Code for creating a room below
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log('Created offer:', offer);

      const roomWithOffer = {
        'offer': {
          type: offer.type,
          sdp: offer.sdp,
        },
      };
      await roomRef.set(roomWithOffer);
      this.roomId = roomRef.id;
      console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
      this.currentRoom = `Current room is ${roomRef.id} - You are the caller!`;
      // Code for creating a room above

      this.peerConnection.addEventListener('track', event => {
        console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
          console.log('Add a track to the remoteStream:', track);
          this.remoteStream.addTrack(track);
        });
      });

      // Listening for remote session description below
      roomRef.onSnapshot(async snapshot => {
        const data = snapshot.data();
        if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
          console.log('Got remote description: ', data.answer);
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(rtcSessionDescription);
        }
      });
      // Listening for remote session description above

      // Listen for remote ICE candidates below
      roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'added') {
            let data = change.doc.data();
            console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
      // Listen for remote ICE candidates above
    },
    async joinRoom() {
      this.createBtnDisabled = true;
      this.joinBtnDisabled = true;
      this.roomDialog.open();
    },
    async confirmJoin() {
      const roomId = this.roomId;
      console.log('Join room: ', roomId);
      this.currentRoom = `Current room is ${roomId} - You are the callee!`;
      await this.joinRoomById(roomId);
    },
    async joinRoomById(roomId) {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(`${roomId}`);
      const roomSnapshot = await roomRef.get();
      console.log('Got room:', roomSnapshot.exists);

      if (roomSnapshot.exists) {
        console.log('Create PeerConnection with configuration: ', this.configuration);
        this.peerConnection = new RTCPeerConnection(this.configuration);
        this.registerPeerConnectionListeners();
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });

        // Code for collecting ICE candidates below
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
        this.peerConnection.addEventListener('icecandidate', event => {
          if (!event.candidate) {
            console.log('Got final candidate!');
            return;
          }
          console.log('Got candidate: ', event.candidate);
          calleeCandidatesCollection.add(event.candidate.toJSON());
        });
        // Code for collecting ICE candidates above

        this.peerConnection.addEventListener('track', event => {
          console.log('Got remote track:', event.streams[0]);
          event.streams[0].getTracks().forEach(track => {
            console.log('Add a track to the remoteStream:', track);
            this.remoteStream.addTrack(track);
          });
        });

        // Code for creating SDP answer below
        const offer = roomSnapshot.data().offer;
        console.log('Got offer:', offer);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        console.log('Created answer:', answer);
        await this.peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        };
        await roomRef.update(roomWithAnswer);
        // Code for creating SDP answer above

        // Listening for remote ICE candidates below
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
          snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
              let data = change.doc.data();
              console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
              await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });
        // Listening for remote ICE candidates above
      }
    },
    async openUserMedia() {
      const stream = await navigator.mediaDevices.getUserMedia(
        { video: true, audio: true });
      this.localStream = stream;
      this.remoteStream = new MediaStream();
      document.querySelector('#localVideo').srcObject = this.localStream;
      document.querySelector('#remoteVideo').srcObject = this.remoteStream;
      this.createBtnDisabled = false;
      this.joinBtnDisabled = false;
      this.hangupBtnDisabled = false;
    },
    async hangUp() {
      const tracks = this.localStream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });

      if (this.remoteStream) {
        this.remoteStream.getTracks().forEach(track => track.stop());
      }

      if (this.peerConnection) {
        this.peerConnection.close();
      }

      document.querySelector('#localVideo').srcObject = null;
      document.querySelector('#remoteVideo').srcObject = null;
      this.localStream = null;
      this.remoteStream = null;
      this.roomId = null;
      this.createBtnDisabled = false;
      this.joinBtnDisabled = false;
      this.hangupBtnDisabled = true;
      this.currentRoom = '';

      // Delete room on hangup
      if (this.roomId) {
        const db = firebase.firestore();
        const roomRef = db.collection('rooms').doc(this.roomId);
        const calleeCandidates = await roomRef.collection('calleeCandidates').get();
        calleeCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        const callerCandidates = await roomRef.collection('callerCandidates').get();
        callerCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        await roomRef.delete();
      }

      document.location.reload(true);
    },
    registerPeerConnectionListeners() {
      this.peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
          `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
      });

      this.peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${this.peerConnection.connectionState}`);
      });

      this.peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
      });

      this.peerConnection.addEventListener('iceconnectionstatechange', () => {
        console.log(
          `ICE connection state change: ${this.peerConnection.iceConnectionState}`);
      });
    },
  },
  mounted() {
    this.roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
  },
};
</script>

<style scoped>
/* Estilos Vue.js aqui */
</style>
