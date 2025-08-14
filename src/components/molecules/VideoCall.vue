<template>
  <div class="video-call">
    <v-row class="video-container" align="center" justify="center" no-gutters>
      <!-- Local video stream -->
      <v-col cols="12" lg="6" md="6" sm="6">
        <video ref="localVideo" autoplay muted playsinline class="video-element"></video>
      </v-col>

      <!-- Remote video stream -->
      <v-col cols="12" lg="6" md="6" sm="6">
        <video ref="remoteVideo" autoplay playsinline class="video-element"></video>
      </v-col>
    </v-row>

    <v-row justify="center">
      <!-- Button to start the call if user is caller and call hasn't started -->
      <v-btn v-if="caller && !callStarted" color="primary" @click="startCall">Start Call</v-btn>

      <!-- Button to answer the call if user is callee and call hasn't started -->
      <v-btn v-else-if="!caller && !callStarted" color="success" @click="answerCall">Answer Call</v-btn>

      <!-- Button to end the call if user is caller and call has started -->
      <!-- <v-btn v-if="caller && callStarted" color="error" class="ml-1" @click="endCall">End Call</v-btn> -->
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { database } from '@/firebase';
import { ref as dbRef, set, onValue, push, off, get, onDisconnect } from 'firebase/database';

// Props received from parent component
const props = defineProps({
  caller: Boolean, // whether the user is the caller
  roomId: String,  // unique room identifier
});

const localVideo = ref(null);
const remoteVideo = ref(null);

const localStream = ref(null);       // user's local media stream
const peerConnection = ref(null);    // WebRTC peer connection
const callStarted = ref(false);      // call status

// Initialize WebRTC connection
async function init() {
  peerConnection.value = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  // Listen for remote tracks
  peerConnection.value.ontrack = (event) => {
    if (remoteVideo.value && remoteVideo.value.srcObject !== event.streams[0]) {
      remoteVideo.value.srcObject = event.streams[0];
    }
  };

  // Send local ICE candidates to Firebase
  peerConnection.value.onicecandidate = async (event) => {
    if (!event.candidate) return;
    const candidateRef = dbRef(database, `calls/${props.roomId}/candidates`);
    await push(candidateRef, event.candidate.toJSON());
  };

  // Automatic reconnection for caller if ICE disconnects
  peerConnection.value.oniceconnectionstatechange = async () => {
    if (props.caller && peerConnection.value.iceConnectionState === 'disconnected') {
      console.log('Caller disconnected. Restarting ICE...');
      await restartCall();
    }
  };

  // Get local media stream if not already available
  if (!localStream.value) {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideo.value) localVideo.value.srcObject = localStream.value;
    } catch (err) {
      console.error('Error accessing camera/microphone:', err);
    }
  }

  // Add local tracks to peer connection
  localStream.value.getTracks().forEach(track => peerConnection.value.addTrack(track, localStream.value));

  // Listen for caller disconnect (for callee)
  if (!props.caller) {
    onValue(dbRef(database, `calls/${props.roomId}`), (snapshot) => {
      if (!snapshot.exists() && callStarted.value) {
        console.log('Room removed by caller, ending connection...');

        // Close peer connection and stop tracks
        if (peerConnection.value) peerConnection.value.close();
        if (localStream.value) localStream.value.getTracks().forEach(track => track.stop());

        // Reset local state
        peerConnection.value = null;
        localStream.value = null;
        callStarted.value = false;
      }
    });
  }
}

// Listen for remote ICE candidates and add them to peer connection
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
        console.error('Error adding ICE candidate:', err);
      }
    }
  });
}

// Restart the call for caller in case of ICE failure
async function restartCall() {
  try {
    const offer = await peerConnection.value.createOffer({ iceRestart: true });
    await peerConnection.value.setLocalDescription(offer);
    const offerRef = dbRef(database, `calls/${props.roomId}/offer`);
    await set(offerRef, { sdp: offer.sdp, type: offer.type });
    console.log('New offer sent after reconnection.');
  } catch (err) {
    console.error('Failed to restart ICE:', err);
  }
}

// Start the call (caller)
async function startCall() {
  await init();

  const offerRef = dbRef(database, `calls/${props.roomId}/offer`);
  const snapshot = await get(offerRef);
  const offerExists = snapshot.exists();

  // If room already exists, recreate offer for reconnection
  if (offerExists && peerConnection.value.signalingState === 'closed') {
    console.log('Caller reconnection: recreating offer...');
    peerConnection.value = null;
    await init();
  }

  const offer = await peerConnection.value.createOffer({ iceRestart: true });
  await peerConnection.value.setLocalDescription(offer);
  await set(offerRef, { sdp: offer.sdp, type: offer.type });

  if (props.caller) {
    const roomRef = dbRef(database, `calls/${props.roomId}`);
    // Set removal of room on client disconnect
    await onDisconnect(roomRef).remove();
  }

  const answerRef = dbRef(database, `calls/${props.roomId}/answer`);
  onValue(answerRef, async (snapshot) => {
    const data = snapshot.val();
    if (data && peerConnection.value.signalingState === 'have-local-offer') {
      console.log('signaling state => ', peerConnection.value.signalingState)
      console.log('offer data =>', data)
      await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data));
      callStarted.value = true;
      listenForCandidates();
    }
  });
}

// Answer the call (callee)
async function answerCall() {
  await init();

  const offerRef = dbRef(database, `calls/${props.roomId}/offer`);
  const snapshot = await get(offerRef);
  const offerData = snapshot.val();

  if (!offerData) {
    console.warn('No offer found. Please wait for the caller.');
    return;
  }

  // Re-initialize if peer connection was closed (caller disconnected)
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

// End the call
async function endCall() {
  // Stop local media tracks
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
  }

  // Close peer connection
  if (peerConnection.value) {
    peerConnection.value.close();
  }

  // Remove room from Firebase if caller
  if (props.caller) {
    const roomRef = dbRef(database, `calls/${props.roomId}`);
    // Cancel any onDisconnect operation
    await onDisconnect(roomRef).cancel();

    await set(roomRef, null);
    console.log('Room removed, callee will also be disconnected.');
  }

  // Reset local state
  localStream.value = null;
  peerConnection.value = null;
  callStarted.value = false;
}

// Initialize call on mount
onMounted(() => {
  init();
});

// Cleanup on component unmount
onBeforeUnmount(() => {
  endCall();
});
</script>
