<template>
  <div>
    <v-btn @click="start">Conectar</v-btn>
    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <video ref="localVideo" autoplay playsinline muted></video>
      <video ref="remoteVideo" autoplay playsinline></video>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '@/firebase'
import {
  doc, getDoc, setDoc, updateDoc, collection,
  addDoc, onSnapshot, getDocs, deleteDoc,
} from 'firebase/firestore'

const localVideo = ref(null)
const remoteVideo = ref(null)

const localStream = ref(null)
const remoteStream = ref(new MediaStream())
const peerConnection = ref(null)
const roomId = 'test-room'

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

async function start() {
  // Obtem stream local
  localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  localVideo.value.srcObject = localStream.value

  // Inicializa conexão
  peerConnection.value = new RTCPeerConnection(config)

  // Adiciona tracks locais
  localStream.value.getTracks().forEach(track => {
    peerConnection.value.addTrack(track, localStream.value)
  })

  // Define stream remota
  peerConnection.value.ontrack = (event) => {
    console.log('[track] recebida')
    event.streams[0].getTracks().forEach(track => {
      remoteStream.value.addTrack(track)
    })
    remoteVideo.value.srcObject = remoteStream.value
  }

  // Logging de estados
  peerConnection.value.addEventListener('connectionstatechange', async () => {
    const state = peerConnection.value.connectionState
    console.log('[connectionstatechange]', state)

    // If disconnected, failed or closed, cleanup
    if (['disconnected', 'failed', 'closed'].includes(state)) {
      await cleanupRoom()
    }
  })

  const roomRef = doc(db, 'rooms', roomId)
  const callerCandidates = collection(roomRef, 'callerCandidates')
  const calleeCandidates = collection(roomRef, 'calleeCandidates')

  const roomSnap = await getDoc(roomRef)
  const isCaller = !roomSnap.exists()

  peerConnection.value.onicecandidate = async (event) => {
    if (event.candidate) {
      const json = event.candidate.toJSON()
      await addDoc(isCaller ? callerCandidates : calleeCandidates, json)
    }
  }

  if (isCaller) {
    console.log('Sou o caller')
    const offer = await peerConnection.value.createOffer()
    await peerConnection.value.setLocalDescription(offer)

    await setDoc(roomRef, { offer: { type: offer.type, sdp: offer.sdp } })

    onSnapshot(roomRef, async snapshot => {
      const data = snapshot.data()
      if (data?.answer && !peerConnection.value.currentRemoteDescription) {
        const answer = new RTCSessionDescription(data.answer)
        await peerConnection.value.setRemoteDescription(answer)
      }
    })

    onSnapshot(calleeCandidates, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data())
          peerConnection.value.addIceCandidate(candidate)
        }
      })
    })

  } else {
    console.log('Sou o callee')
    const offer = roomSnap.data().offer
    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await peerConnection.value.createAnswer()
    await peerConnection.value.setLocalDescription(answer)

    await updateDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } })

    onSnapshot(callerCandidates, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data())
          peerConnection.value.addIceCandidate(candidate)
        }
      })
    })
  }

  async function cleanupRoom() {
    const roomRef = doc(db, 'rooms', roomId)

    // Apaga candidatos
    const callerCandidates = await getDocs(collection(roomRef, 'callerCandidates'))
    const calleeCandidates = await getDocs(collection(roomRef, 'calleeCandidates'))

    for (const docSnap of callerCandidates.docs) {
      await deleteDoc(docSnap.ref)
    }

    for (const docSnap of calleeCandidates.docs) {
      await deleteDoc(docSnap.ref)
    }

    // Apaga a sala
    try {
      await deleteDoc(roomRef)
    } catch (e) {
      console.warn('Sala já estava apagada:', e.message)
    }

    // Fecha o peerConnection
    if (peerConnection.value) {
      peerConnection.value.close()
      peerConnection.value = null
    }

    // Limpa as streams
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }

    remoteStream.value = new MediaStream()
    remoteVideo.value.srcObject = null
  }

}
</script>
<style scoped>
.video {
  border-radius: 30px;
  width: 100%;
  object-fit: contain;
  height: 100%;
}
</style>