<template>
  <div class="video-call">
    <v-row class="video-container" align="center" justify="center" no-gutters>
      <v-col cols="12" lg="6" md="6" sm="6">
        <video ref="localVideo" autoplay muted playsinline class="video-element"></video>
      </v-col>

      <v-col cols="12" lg="6" md="6" sm="6">
        <video ref="remoteVideo" autoplay playsinline class="video-element"></video>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-btn v-if="caller && !callStarted" color="primary" @click="startCall">Start Call</v-btn>
      <v-btn v-else-if="!caller && !callStarted" color="success" @click="answerCall">Answer Call</v-btn>
      <v-btn v-if="caller && callStarted" color="error" class="ml-1" @click="endCall">End Call</v-btn>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { database } from '@/firebase';
import { ref as dbRef, set, onValue, push, off, get } from 'firebase/database';

const props = defineProps({
  caller: Boolean,
  roomId: String,
});

const localVideo = ref(null);
const remoteVideo = ref(null);

const localStream = ref(null);
const peerConnection = ref(null);
const callStarted = ref(false);

// Inicia a conexão WebRTC
async function init() {
  peerConnection.value = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  peerConnection.value.ontrack = (event) => {
    if (remoteVideo.value && remoteVideo.value.srcObject !== event.streams[0]) {
      remoteVideo.value.srcObject = event.streams[0];
    }
  };

  peerConnection.value.onicecandidate = async (event) => {
    if (!event.candidate) return;
    const candidateRef = dbRef(database, `calls/${props.roomId}/candidates`);
    await push(candidateRef, event.candidate.toJSON());
  };

  // Reconexão automática do caller
  peerConnection.value.oniceconnectionstatechange = async () => {
    if (props.caller && peerConnection.value.iceConnectionState === 'disconnected') {
      console.log('Caller disconnected. Restarting ICE...');
      await restartCall();
    }
  };

  if (!localStream.value) {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideo.value) localVideo.value.srcObject = localStream.value;
    } catch (err) {
      console.error('Erro ao acessar câmera/microfone:', err);
    }
  }

  localStream.value.getTracks().forEach(track => peerConnection.value.addTrack(track, localStream.value));
}

// Escuta candidatos remotos
function listenForCandidates() {
  const candidateRef = dbRef(database, `calls/${props.roomId}/candidates`);
  onValue(candidateRef, async (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    const candidates = Object.values(data);
    for (const candidate of candidates) {
      try {
        if (peerConnection.value.remoteDescription) {
          await peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Erro adicionando ICE candidate:', err);
      }
    }
  });
}

// Reinicia a chamada (caller)
async function restartCall() {
  try {
    const offer = await peerConnection.value.createOffer({ iceRestart: true });
    await peerConnection.value.setLocalDescription(offer);
    const offerRef = dbRef(database, `calls/${props.roomId}/offer`);
    await set(offerRef, { sdp: offer.sdp, type: offer.type });
    console.log('Nova offer enviada após reconexão.');
  } catch (err) {
    console.error('Falha ao reiniciar ICE:', err);
  }
}

// Inicia a chamada (caller)
async function startCall() {
  await init();

  const offerRef = dbRef(database, `calls/${props.roomId}/offer`);
  const snapshot = await get(offerRef);
  const offerExists = snapshot.exists();

  // Se a sala já existe, recria a offer para reconexão
  if (offerExists && peerConnection.value.signalingState === 'closed') {
    console.log('Reconexão do caller: recriando offer...');
    peerConnection.value = null;
    await init();
  }

  const offer = await peerConnection.value.createOffer({ iceRestart: true });
  await peerConnection.value.setLocalDescription(offer);
  await set(offerRef, { sdp: offer.sdp, type: offer.type });

  const answerRef = dbRef(database, `calls/${props.roomId}/answer`);
  onValue(answerRef, async (snapshot) => {
    const data = snapshot.val();
    if (data && peerConnection.value.signalingState === 'have-local-offer') {
      await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data));
      callStarted.value = true;
      listenForCandidates();
    }
  });
}

async function answerCall() {
  await init();

  const offerRef = dbRef(database, `calls/${props.roomId}/offer`);
  const snapshot = await get(offerRef);
  const offerData = snapshot.val();

  if (!offerData) {
    console.warn('Nenhuma offer encontrada. Aguarde o caller.');
    return;
  }

  // Se peerConnection já existe mas estava fechado (calle caiu), recria
  if (!peerConnection.value || peerConnection.value.signalingState === 'closed') {
    await init();
  }

  await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offerData));
  const answer = await peerConnection.value.createAnswer();
  await peerConnection.value.setLocalDescription(answer);

  const answerRef = dbRef(database, `calls/${props.roomId}/answer`);
  await set(answerRef, { sdp: answer.sdp, type: answer.type });

  callStarted.value = true;
  listenForCandidates();
}

// Encerra a chamada
async function endCall() {
  if (localStream.value) localStream.value.getTracks().forEach(track => track.stop());
  if (peerConnection.value) peerConnection.value.close();

  await set(dbRef(database, `calls/${props.roomId}`), null);

  localStream.value = null;
  peerConnection.value = null;
  callStarted.value = false;
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  endCall();
});
</script>
