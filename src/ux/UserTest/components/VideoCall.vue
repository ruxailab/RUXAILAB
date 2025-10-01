<template>
  <v-container fluid class="video-call-container fill-height mt-6" :class="{ 'panel-open': showSidePanel }">

    <v-row class="video-row fill-height justify-center" no-gutters>
      <v-col cols="12" class="d-flex justify-center align-center">
        <div class="videos-container">
          <!-- Local Video -->
          <div class="video-container">
            <video ref="localVideo" autoplay muted playsinline class="video-element"></video>
            
            <!-- Camera disabled overlay -->
            <div v-if="!isCameraEnabled" class="camera-disabled-overlay">
              <v-icon size="64" color="white" class="mb-2">mdi-video-off</v-icon>
              <p class="text-white">Camera is off</p>
            </div>
            
            <!-- Microphone muted indicator -->
            <div v-if="!isMicrophoneEnabled" class="mic-muted-indicator">
              <v-icon size="24" color="white">mdi-microphone-off</v-icon>
            </div>
            
            <!-- Video label -->
            <div class="video-label">Tu video</div>
          </div>

          <!-- Remote Video -->
          <div class="video-container">
            <div v-show="!callStarted" class="not-connected-message">
              Not connected
            </div>
            <video v-show="callStarted" ref="remoteVideo" autoplay playsinline class="video-element"></video>
            
            <!-- Video label -->
            <div v-if="callStarted" class="video-label">
              {{ caller ? 'Participante' : 'Moderador' }}
            </div>
          </div>
        </div>
      </v-col>
    </v-row>



    <!-- Fixed Bottom Control Bar -->
    <div class="bottom-control-bar">
      <div class="control-bar-layout">
        <!-- Left side - spacer -->
        <div class="control-bar-left"></div>
        
        <!-- Center - main controls -->
        <div class="control-buttons-container">
          <!-- Camera toggle button -->
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn 
                v-bind="props"
                :class="{ 'control-btn-disabled': !isCameraEnabled, 'control-btn-enabled': isCameraEnabled }" 
                class="control-btn" 
                icon 
                size="large"
                @click="toggleCamera"
              >
                <v-icon size="28">{{ isCameraEnabled ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ isCameraEnabled ? 'Turn off camera' : 'Turn on camera' }}</span>
          </v-tooltip>

          <!-- Microphone toggle button -->
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn 
                v-bind="props"
                :class="{ 'control-btn-disabled': !isMicrophoneEnabled, 'control-btn-enabled': isMicrophoneEnabled }" 
                class="control-btn" 
                icon 
                size="large"
                @click="toggleMicrophone"
              >
                <v-icon size="28">{{ isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone' }}</span>
          </v-tooltip>
        </div>
        
        <!-- Right side - panel toggle -->
        <div class="control-bar-right">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn 
                v-bind="props"
                :class="{ 'control-btn-active': showSidePanel, 'control-btn-enabled': !showSidePanel }" 
                class="control-btn" 
                icon 
                size="large"
                @click="toggleSidePanel"
              >
                <v-icon size="28">mdi-dock-right</v-icon>
              </v-btn>
            </template>
            <span>{{ showSidePanel ? 'Hide panel' : 'Show panel' }}</span>
          </v-tooltip>
        </div>
      </div>
    </div>

    <!-- Side Panel -->
    <div class="side-panel" :class="{ 'side-panel-open': showSidePanel }">
      <div class="side-panel-header">
        <h3>Panel de Herramientas</h3>
        <v-btn 
          icon 
          size="small" 
          variant="text" 
          @click="toggleSidePanel"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      
      <div class="side-panel-content">
        <!-- Session Controls Section -->
        <div class="panel-section">
          <h4>Control de Sesión</h4>
          
          <!-- Connection controls when call is not started -->
          <div v-if="!callStarted" class="session-controls">
            <!-- Open Room button (for caller) -->
            <v-btn 
              v-if="caller"
              color="primary" 
              size="large" 
              block 
              class="mb-3"
              @click="startCall"
            >
              <v-icon left>mdi-video-plus</v-icon>
              Open Room
            </v-btn>

            <!-- Join Room button (for participant) -->
            <v-btn 
              v-else
              color="primary" 
              size="large" 
              block 
              class="mb-3"
              @click="answerCall"
              :disabled="!roomExists"
            >
              <v-icon left>mdi-video</v-icon>
              {{ roomExists ? 'Join Room' : 'Waiting for moderator...' }}
            </v-btn>

            <!-- Status message -->
            <div class="status-message">
              <v-chip 
                :color="caller ? 'blue' : (roomExists ? 'green' : 'orange')" 
                size="small" 
                class="mb-2"
              >
                <v-icon left size="16">
                  {{ caller ? 'mdi-account-star' : (roomExists ? 'mdi-check' : 'mdi-clock') }}
                </v-icon>
                {{ caller ? 'Moderador' : (roomExists ? 'Listo para unirse' : 'Esperando...') }}
              </v-chip>
            </div>
          </div>

          <!-- Call controls when call is active -->
          <div v-else class="session-controls">
            <!-- Proceed to next step (only for moderator) -->
            <v-btn 
              v-if="caller"
              color="success" 
              size="large" 
              block 
              class="mb-3"
              @click="proceedToNextStep"
            >
              <v-icon left>mdi-arrow-right</v-icon>
              Proceed to Next Step
            </v-btn>

            <!-- End call button -->
            <v-btn 
              color="error" 
              size="large" 
              block 
              variant="outlined"
              @click="endCall"
            >
              <v-icon left>mdi-phone-hangup</v-icon>
              End Call
            </v-btn>

            <!-- Call status -->
            <div class="status-message">
              <v-chip color="green" size="small" class="mb-2">
                <v-icon left size="16">mdi-phone</v-icon>
                Llamada activa
              </v-chip>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h4>Participantes</h4>
          <div class="participant-item">
            <v-avatar size="32" :color="caller ? 'blue' : 'green'">
              <v-icon color="white">{{ caller ? 'mdi-account-star' : 'mdi-account' }}</v-icon>
            </v-avatar>
            <div class="participant-info">
              <span class="participant-name">{{ caller ? 'Moderador (Tú)' : 'Participante (Tú)' }}</span>
              <div class="participant-status">
                <v-chip size="x-small" color="green" v-if="isCameraEnabled">Cámara</v-chip>
                <v-chip size="x-small" color="red" v-else>Sin cámara</v-chip>
                <v-chip size="x-small" color="green" v-if="isMicrophoneEnabled" class="ml-1">Micrófono</v-chip>
                <v-chip size="x-small" color="red" v-else class="ml-1">Sin micrófono</v-chip>
              </div>
            </div>
          </div>
          <div class="participant-item" v-if="callStarted">
            <v-avatar size="32" :color="caller ? 'green' : 'blue'">
              <v-icon color="white">{{ caller ? 'mdi-account' : 'mdi-account-star' }}</v-icon>
            </v-avatar>
            <div class="participant-info">
              <span class="participant-name">{{ caller ? 'Participante' : 'Moderador' }}</span>
              <div class="participant-status">
                <v-chip size="x-small" color="green">Conectado</v-chip>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-section">
          <h4>Configuración</h4>
          <v-list density="compact">
            <v-list-item @click="toggleCamera">
              <template #prepend>
                <v-icon :color="isCameraEnabled ? 'green' : 'red'">
                  {{ isCameraEnabled ? 'mdi-video' : 'mdi-video-off' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{ isCameraEnabled ? 'Desactivar cámara' : 'Activar cámara' }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleMicrophone">
              <template #prepend>
                <v-icon :color="isMicrophoneEnabled ? 'green' : 'red'">
                  {{ isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{ isMicrophoneEnabled ? 'Silenciar micrófono' : 'Activar micrófono' }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="!caller && callStarted" @click="toggleCameraScreen">
              <template #prepend>
                <v-icon :color="isSharingScreen ? 'blue' : 'grey'">
                  {{ isSharingScreen ? 'mdi-monitor-off' : 'mdi-monitor-screenshot' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{ isSharingScreen ? 'Detener compartir pantalla' : 'Compartir pantalla' }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </div>

    <!-- Overlay for panel (mobile) -->
    <div 
      v-if="showSidePanel" 
      class="panel-overlay"
      @click="toggleSidePanel"
    ></div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { database } from '@/app/plugins/firebase/index';
import { ref as dbRef, set, onValue, push, off, get, onDisconnect } from 'firebase/database';

// Props received from parent component
const props = defineProps({
  caller: Boolean, // whether the user is the caller
  roomId: String,  // unique room identifier
});

const emit = defineEmits([
    'setRemoteStream',
    'proceedToNextStep'
]);

const localVideo = ref(null);
const remoteVideo = ref(null);

const localStream = ref(null);       // user's local media stream
const peerConnection = ref(null);    // WebRTC peer connection
const callStarted = ref(false);      // call status
const roomExists = ref(false);

const isSharingScreen = ref(false);
const screenStream = ref(null);

// Camera and microphone controls
const isCameraEnabled = ref(true);
const isMicrophoneEnabled = ref(true);

// Side panel control
const showSidePanel = ref(false);

// Toggle camera on/off
function toggleCamera() {
  if (!localStream.value) return;
  
  const videoTrack = localStream.value.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    isCameraEnabled.value = videoTrack.enabled;
  }
}

// Toggle microphone mute/unmute
function toggleMicrophone() {
  if (!localStream.value) return;
  
  const audioTrack = localStream.value.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    isMicrophoneEnabled.value = audioTrack.enabled;
  }
}

// Toggle side panel
function toggleSidePanel() {
  showSidePanel.value = !showSidePanel.value;
}

// Proceed to next step
function proceedToNextStep() {
  emit('proceedToNextStep');
}

async function toggleCameraScreen() {
  if (isSharingScreen.value) {
    stopScreenShare();
  } else {
    startScreenShare();
  }
}

async function startScreenShare() {
  try {
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

    const videoTrack = screenStream.value.getVideoTracks()[0];
    const audioTrack = screenStream.value.getAudioTracks()[0];

    const sender = peerConnection.value.getSenders().find(s => s.track.kind === 'video');
    if (sender) {
      sender.replaceTrack(videoTrack);
    }

    const audioSender = peerConnection.value.getSenders().find(s => s.track.kind === 'audio');
    if (audioSender) {
      audioSender.replaceTrack(audioTrack);
    }

    localStream.value = screenStream.value;
    if (localVideo.value) {
      localVideo.value.srcObject = localStream.value;
    }

    videoTrack.onended = () => {
      console.log('Screen sharing stopped by user.');
      stopScreenShare();
    };

    isSharingScreen.value = true;
  } catch (err) {
    console.error('Error starting screen share:', err);
    isSharingScreen.value = false;
  }
}

async function stopScreenShare() {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach(track => track.stop());
  }

  localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  const videoTrack = localStream.value.getVideoTracks()[0];
  const audioTrack = localStream.value.getAudioTracks()[0];

  const sender = peerConnection.value.getSenders().find(s => s.track.kind === 'video');
  if (sender) {
    sender.replaceTrack(videoTrack);
  }

  const audioSender = peerConnection.value.getSenders().find(s => s.track.kind === 'audio');
  if (audioSender) {
    audioSender.replaceTrack(audioTrack);
  }

  if (localVideo.value) {
    localVideo.value.srcObject = localStream.value;
  }

  isSharingScreen.value = false;
  screenStream.value = null;
}

// Initialize WebRTC connection
async function init() {
  peerConnection.value = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

  // Listen for remote tracks
  peerConnection.value.ontrack = (event) => {
    if (remoteVideo.value && remoteVideo.value.srcObject !== event.streams[0]) {
      remoteVideo.value.srcObject = event.streams[0];

      // emit to parent
      emit('setRemoteStream', event.streams[0]);
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

  const { hasCam, hasMic } = await detectDevices();

  // Add video and audio transceivers
  if (!hasCam) peerConnection.value.addTransceiver('video', { direction: 'recvonly' });
  if (!hasMic) peerConnection.value.addTransceiver('audio', { direction: 'recvonly' });

  // Get local media stream if not already available
  if (!localStream.value) {
    try {
      if (hasCam || hasMic) {
        localStream.value = await navigator.mediaDevices.getUserMedia({ video: hasCam, audio: hasMic });
        // Initialize control states
        isCameraEnabled.value = hasCam;
        isMicrophoneEnabled.value = hasMic;
      } else {
        localStream.value = new MediaStream();
        isCameraEnabled.value = false;
        isMicrophoneEnabled.value = false;
      }
    } catch (err) {
      console.error('Error accessing camera/microphone:', err);
      localStream.value = new MediaStream();
      isCameraEnabled.value = false;
      isMicrophoneEnabled.value = false;
    }
  }

  if (localVideo.value) localVideo.value.srcObject = localStream.value;

  // Add local tracks to peer connection
  localStream.value.getTracks().forEach(track => peerConnection.value.addTrack(track, localStream.value));

  // Listen for caller disconnect (for callee)
  if (!props.caller) {
    onValue(dbRef(database, `calls/${props.roomId}`), (snapshot) => {
      roomExists.value = snapshot.exists();
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
  if (offerExists && peerConnection.value && peerConnection.value.signalingState === 'closed') {
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
    if (data && (peerConnection.value && peerConnection.value.signalingState === 'have-local-offer')) {
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

  // Stop screen share stream if active
  if (screenStream.value) {
    screenStream.value.getTracks().forEach(track => track.stop());
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

const detectDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasCam = devices.some(d => d.kind === 'videoinput');
    const hasMic = devices.some(d => d.kind === 'audioinput');
    return { hasCam, hasMic };
  } catch (e) {
    console.warn('enumerateDevices falhou, assumindo sem câmera:', e);
    return { hasCam: false, hasMic: false };
  }
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

<style scoped>
.video-call-container {
  display: flex;

  transition: margin-right 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Adjust content when panel is open on desktop */
@media (min-width: 769px) {
  .video-call-container.panel-open {
    margin-right: 400px;
  }
}

.video-row {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.videos-container {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  width: 100%;
}

.not-connected-message {
  border: 3px solid rgb(var(--v-theme-primary));
  border-radius: 16px;
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  padding: 1rem;
  box-sizing: border-box;
  font-size: 1.1rem;
  font-weight: 500;
}

.video-element {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border: 3px solid rgb(var(--v-theme-primary));
  border-radius: 16px;
  box-sizing: border-box;
}



.v-container {
  padding-top: 0;
  padding-bottom: 0;
}

/* Fixed Bottom Control Bar */
.bottom-control-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 800px;
  width: calc(100% - 32px);
  background: rgba(var(--v-theme-primary), 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 12px 20px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.control-bar-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.control-bar-left,
.control-bar-right {
  flex: 0 0 120px;
  display: flex;
  justify-content: center;
}

.control-buttons-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: white;
}

/* Control button styles */
.control-btn {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.control-btn-enabled {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
}

.control-btn-enabled:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05) !important;
}

.control-btn-disabled {
  background: #ea4335 !important;
  color: white !important;
  border: 2px solid #ea4335 !important;
}

.control-btn-disabled:hover {
  background: #d93025 !important;
  border-color: #d93025 !important;
  transform: scale(1.05) !important;
}

.control-btn-active {
  background: #1976d2 !important;
  color: white !important;
  border: 2px solid #1976d2 !important;
}

.control-btn-active:hover {
  background: #1565c0 !important;
  border-color: #1565c0 !important;
  transform: scale(1.05) !important;
}



/* Video container for overlays */
.video-container {
  position: relative;
  flex: 1;
  max-width: 500px;
  min-width: 300px;
  height: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

/* Video label */
.video-label {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  z-index: 20;
}

/* Camera disabled overlay */
.camera-disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Microphone muted indicator */
.mic-muted-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(234, 67, 53, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  backdrop-filter: blur(4px);
}

/* Side Panel */
.side-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  z-index: 1500;
  transition: right 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.side-panel-open {
  right: 0;
}

.side-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.side-panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  color: #666 !important;
}

.side-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.panel-section {
  margin-bottom: 32px;
}

.panel-section h4 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #333;
}

.participant-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  color: #333;
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-size: 0.9rem;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.participant-status {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.session-controls {
  margin-bottom: 16px;
}

.status-message {
  text-align: center;
  margin-top: 12px;
}



/* Panel overlay for mobile */
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1400;
  display: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .side-panel {
    width: 100%;
    right: -100%;
  }
  
  .panel-overlay {
    display: block;
  }
  
  .control-bar-left,
  .control-bar-right {
    flex: 0 0 60px;
  }
  
  .bottom-control-bar {
    bottom: 12px;
    width: calc(100% - 24px);
    padding: 10px 14px;
    border-radius: 20px;
  }
  
  .video-row {
    padding: 10px;
  }
  
  .videos-container {
    gap: 10px;
    flex-direction: row;
  }
  
  .video-container {
    height: 250px;
    max-width: 350px;
    min-width: 200px;
  }
  
  .video-element {
    height: 250px;
  }
  
  .not-connected-message {
    height: 250px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .videos-container {
    gap: 8px;
  }
  
  .video-container {
    height: 180px;
    max-width: 280px;
    min-width: 150px;
  }
  
  .video-element {
    height: 180px;
  }
  
  .not-connected-message {
    height: 180px;
    font-size: 0.85rem;
  }
  
  .bottom-control-bar {
    bottom: 8px;
    width: calc(100% - 16px);
    padding: 8px 10px;
    border-radius: 16px;
  }
}
</style>
