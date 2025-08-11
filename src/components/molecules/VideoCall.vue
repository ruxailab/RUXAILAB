<template>
  <div class="video-call">
    <video ref="localVideo" autoplay muted playsinline></video>
    <video ref="remoteVideo" autoplay playsinline></video>
    <div class="controls">
      <button v-if="caller" @click="startCall">Start Call</button>
      <button v-else @click="answerCall">Answer Call</button>
      <button @click="endCall">End Call</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { database } from '@/firebase';
import { ref as dbRef, set, onValue, push, onChildRemoved } from 'firebase/database';

// Props
const props = defineProps({
  caller: {
    type: Boolean,
    required: true
  },
  roomId: {
    type: String,
    required: true,
  }
})


// References to the video elements
const localVideo = ref(null);
const remoteVideo = ref(null);

// Reactive state variables
const localStream = ref(null);
const peerConnection = ref(null);
const roomId = ref(null); // Could be dynamic

// Initialize the WebRTC connection and media
async function init() {
  peerConnection.value = null;
  localStream.value = null;
  roomId.value = 'your_room_id'; // or dynamic id

  // ICE servers configuration
  const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  peerConnection.value = new RTCPeerConnection(servers);

  // When remote track arrives, set it to the remote video element
  peerConnection.value.ontrack = (event) => {
    remoteVideo.value.srcObject = event.streams[0];
  };

  // Handle ICE candidates and push them to Firebase
  peerConnection.value.onicecandidate = async (event) => {
    if (event.candidate) {
      const candidateRef = dbRef(database, `calls/${roomId.value}/candidates`);
      await push(candidateRef, event.candidate.toJSON());
    }
  };

  // Listen for room removal to end call automatically
  const callsRef = dbRef(database, `calls/`);
  onChildRemoved(callsRef, (snapshot) => {
    if (snapshot.key === roomId.value) {
      console.log('Call ended by remote');
      endCall(false);
    }
  });

  // Access user media (camera and microphone)
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.value.srcObject = localStream.value;

    // Add local tracks to the peer connection
    localStream.value.getTracks().forEach(track => {
      peerConnection.value.addTrack(track, localStream.value);
    });
  } catch (error) {
    console.error('Error accessing media devices:', error);
  }
}

// Listen for incoming ICE candidates from Firebase and add to peer connection
function listenForCandidates() {
  const candidateRef = dbRef(database, `calls/${roomId.value}/candidates`);
  onValue(candidateRef, async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      console.log('Received new ICE candidates');
      const candidates = Object.values(data);
      for (const candidate of candidates) {
        try {
          if (peerConnection.value.remoteDescription) {
            await peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    }
  });
}

// Starts the call by creating an offer and saving it in Firebase
async function startCall() {
  if (!peerConnection.value) {
    console.error('PeerConnection not initialized. Initializing now...');
    await init();
  }

  const offer = await peerConnection.value.createOffer();
  await peerConnection.value.setLocalDescription(offer);

  // Save the offer to Firebase
  const offerRef = dbRef(database, `calls/${roomId.value}/offer`);
  await set(offerRef, {
    sdp: offer.sdp,
    type: offer.type
  });

  console.log('Offer sent, waiting for answer...');

  // Listen for answer from remote peer
  const answerRef = dbRef(database, `calls/${roomId.value}/answer`);
  onValue(answerRef, async (snapshot) => {
    const data = snapshot.val();
    if (data && peerConnection.value && peerConnection.value.signalingState === 'have-local-offer') {
      console.log('Answer received, setting remote description...');
      const remoteDesc = new RTCSessionDescription(data);
      await peerConnection.value.setRemoteDescription(remoteDesc);
      listenForCandidates();
    }
  });
}

// Answers a call by retrieving the offer from Firebase and sending an answer
async function answerCall() {
  const offerRef = dbRef(database, `calls/${roomId.value}/offer`);
  onValue(offerRef, async (snapshot) => {
    const data = snapshot.val();
    if (data) {
      console.log('Offer received, setting remote description...');
      const offer = new RTCSessionDescription(data);
      await peerConnection.value.setRemoteDescription(offer);

      const answer = await peerConnection.value.createAnswer();
      await peerConnection.value.setLocalDescription(answer);

      const answerRef = dbRef(database, `calls/${roomId.value}/answer`);
      await set(answerRef, {
        sdp: answer.sdp,
        type: answer.type
      });

      // Now listen for ICE candidates
      listenForCandidates();
    }
  });
}

// Ends the call and optionally removes the room from Firebase
function endCall(shouldRemoveFromDB = true) {
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
  }
  if (peerConnection.value) {
    peerConnection.value.close();
  }

  if (shouldRemoveFromDB) {
    const roomRef = dbRef(database, `calls/${roomId.value}`);
    set(roomRef, null)
      .then(() => console.log(`Room ${roomId.value} removed from database.`))
      .catch(error => console.error('Error removing room:', error));
  }

  localStream.value = null;
  peerConnection.value = null;

  // Re-initialize for a new call
  init();
}

// Lifecycle hooks
onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  endCall();
});
</script>

<style scoped>
.video-call {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

video {
  width: 100%;
  max-width: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.controls {
  display: flex;
  gap: 1rem;
}
</style>
