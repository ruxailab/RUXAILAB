<template>
  <v-container fluid>
    <v-row
      class="mb-2"
      justify="center"
    >
      <v-col cols="10">
        <v-btn
          v-if="index === 0"
          :disabled="!consentCompleted && !isAdmin"
          color="green"
          block
          variant="flat"
          @click="openUserCamera"
        >
          CONNECT
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import {
  collection,
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useRouter } from 'vue-router'


const props = defineProps({
  isAdmin: {
    type: Boolean,
  },
  index: {
    type: Number,
  },
  consentCompleted: {
    type: Boolean,
  },
})


const emit = defineEmits(['emit-confirm'])
const store = useStore()
const { t } = useI18n()
const toast = useToast()
const router = useRouter()

const createBtnDisabled = ref(false)
const joinBtnDisabled = ref(false)
const hangupBtnDisabled = ref(true)
const roomId = ref(null)
const currentRoom = ref('')
const roomCollection = ref(null)
const videoSender = ref(null)
const roomDialog = ref(false)
const configuration = ref({
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
})

const localCameraStream = computed(() => store.getters.localCameraStream)
const remoteCameraStream = computed(() => store.getters.remoteCameraStream)
const roomTestAnswerId = computed(() => store.getters.test.testAnswerId)
const roomTestId = computed(() => store.getters.test.id)
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer)
const peerConnection = computed(() => store.getters.peerConnection)

const emitConfirm = () => {
  emit('emit-confirm')
}

const createRoom = async () => {
  console.log('createRoom chamado');

  createBtnDisabled.value = true
  joinBtnDisabled.value = true
  roomCollection.value = collection(db, 'rooms')
  const roomRef = doc(roomCollection.value, roomTestId.value)
  await store.dispatch('createPeerConnection', {
    configuration: configuration.value,
  })

  console.log('localCameraStream.value', localCameraStream);
  localCameraStream.value.getTracks().forEach((track) => {
    videoSender.value = peerConnection.value.addTrack(track, localCameraStream.value)
  })

  const callerCandidatesCollection = collection(roomRef, 'callerCandidates')
  peerConnection.value.addEventListener('icecandidate', (event) => {
    console.log('icecandidate chamado');
    if (!event.candidate) return
    console.log('addDoc callerCandidatesCollection');
    addDoc(callerCandidatesCollection, event.candidate.toJSON())
  })

  const offer = await peerConnection.value.createOffer()
  console.log('createOffer feito');
  await peerConnection.value.setLocalDescription(offer)
  const roomWithOffer = {
    offer: {
      type: offer.type,
      sdp: offer.sdp,
    },
  }
  console.log('vai setar o documento');
  await setDoc(roomRef, roomWithOffer)
  console.log('documento setado');
  roomId.value = roomRef.id
  currentRoom.value = `Current room is ${roomRef.id} - You are the caller!`

  peerConnection.value.addEventListener('track', (event) => {
    console.log('evento track');
    event.streams[0].getTracks().forEach((track) => {
      remoteCameraStream.value.addTrack(track)
    })
  })

  const candidateQueue = []

  onSnapshot(roomRef, async (snapshot) => {
    console.log('onSnapshot chamado');
    const data = snapshot.data()
    if (!peerConnection.value.currentRemoteDescription && data?.answer) {
      const rtcSessionDescription = new RTCSessionDescription(data.answer)
      console.log('vai setar descri o remota');
      await peerConnection.value.setRemoteDescription(rtcSessionDescription)
      console.log('descri o remota setada');

      // Após setar a remoteDescription, aplicar os ICE Candidates armazenados
      for (const candidate of candidateQueue) {
        try {
          await peerConnection.value.addIceCandidate(candidate)
        } catch (e) {
          console.warn('Erro ao aplicar ICE da fila:', e)
        }
      }
      candidateQueue.length = 0
    }
  })

  onSnapshot(collection(roomRef, 'calleeCandidates'), (snapshot) => {
    console.log('onSnapshot calleeCandidates');
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const data = change.doc.data()
        const candidate = new RTCIceCandidate(data)

        if (peerConnection.value.remoteDescription) {
          try {
            console.log('vai adicionar iceCandidate');
            await peerConnection.value.addIceCandidate(candidate)
            console.log('iceCandidate adicionado');
          } catch (e) {
            console.warn('Erro ao adicionar ICE:', e)
          }
        } else {
          console.log('remoteDescription ausente, guardando ICE')
          candidateQueue.push(candidate)
        }
      }
    })
  })

  peerConnection.value.addEventListener('connectionstatechange', () => {
    console.log('connectionstatechange');
    if (
      peerConnection.value.connectionState === 'disconnected' ||
      peerConnection.value.iceConnectionState === 'disconnected'
    ) {
      store.commit('SET_DISCONNECTED', true)
    }
  })
}

const joinRoomById = async (roomId) => {
  const roomRef = doc(collection(db, 'rooms'), roomId)
  const roomSnapshot = await getDoc(roomRef)

  if (!roomSnapshot.exists()) return

  await store.dispatch('createPeerConnection', {
    configuration: configuration.value,
  })

  const localStream = localCameraStream.value
  localStream.getTracks().forEach((track) => {
    videoSender.value = peerConnection.value.addTrack(track, localStream)
  })

  const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates')
  peerConnection.value.addEventListener('icecandidate', async (event) => {
    if (event.candidate) {
      await addDoc(calleeCandidatesCollection, event.candidate.toJSON())
    }
  })

  peerConnection.value.addEventListener('track', (event) => {
    event.streams[0].getTracks().forEach((track) => {
      if (remoteCameraStream.value) {
        remoteCameraStream.value.addTrack(track)
      }
    })
  })

  const candidateQueue = []

  onSnapshot(collection(roomRef, 'callerCandidates'), (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const data = change.doc.data()
        const candidate = new RTCIceCandidate(data)

        if (peerConnection.value.remoteDescription) {
          try {
            await peerConnection.value.addIceCandidate(candidate)
            console.log('ICE adicionado diretamente')
          } catch (e) {
            console.warn('Erro ao adicionar ICE diretamente:', e)
          }
        } else {
          console.log('remoteDescription ainda não setada, guardando ICE na fila')
          candidateQueue.push(candidate)
        }
      }
    })
  })

  // Agora sim: setando a offer vinda do caller
  const offer = roomSnapshot.data().offer
  await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offer))

  const answer = await peerConnection.value.createAnswer()
  await peerConnection.value.setLocalDescription(answer)

  const roomWithAnswer = {
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
  }
  await updateDoc(roomRef, roomWithAnswer)

  // Após setar remoteDescription, processa a fila
  for (const candidate of candidateQueue) {
    try {
      await peerConnection.value.addIceCandidate(candidate)
      console.log('ICE da fila adicionado após remoteDescription')
    } catch (e) {
      console.warn('Erro ao aplicar ICE da fila:', e)
    }
  }
  candidateQueue.length = 0

  peerConnection.value.addEventListener('connectionstatechange', () => {
    if (
      peerConnection.value.connectionState === 'disconnected' ||
      peerConnection.value.iceConnectionState === 'disconnected'
    ) {
      store.commit('SET_DISCONNECTED', true)
    }
  })
}

const openUserCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    console.table(devices)

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true, // simples, sem filtro
      audio: false
    })

    console.log("[openUserCamera] - stream:", stream);

    // Aguarde a ativação da stream (tracks ativas)
    await waitForTracks(stream);

    console.log("[openUserCamera] - tracks disponíveis:", stream.getTracks());

    if (stream) {
      await store.dispatch('setlocalCameraStream', stream)
      const localCameraStream = computed(() => store.getters.localCameraStream)
      await store.dispatch('setremoteCameraStream', new MediaStream())
      console.log("Após dispatch: ", localCameraStream.value);
      emitConfirm()


      createBtnDisabled.value = false
      joinBtnDisabled.value = false
      hangupBtnDisabled.value = false

      console.log('[openUserCamera] - creating/joining room', roomTestId.value)

      if (props.isAdmin) {
        await createRoom(stream)
      } else {
        await joinRoomById(roomTestId.value, stream)
      }
    }
  } catch (e) {
    console.error('[openUserCamera] - error:', e.name, e.message)
    if (e.name === 'NotFoundError') {
      toast.error('Nenhuma câmera ou microfone encontrado.')
    } else if (e.name === 'NotReadableError') {
      toast.error('Câmera ou microfone já está em uso.')
    } else if (e.name === 'NotAllowedError') {
      toast.error('Permissão negada para acessar câmera ou microfone.')
    } else {
      toast.error(t('errors.globalError'))
    }
  }
}

const waitForTracks = (stream) => {
  return new Promise((resolve, reject) => {
    const check = () => {
      const tracks = stream.getTracks();
      if (tracks.length && tracks.every(track => track.readyState === 'live')) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

const hangUp = async () => {
  const tracks = localCameraStream.value?.getTracks()
  tracks?.forEach((track) => track.stop())

  if (remoteCameraStream.value) {
    remoteCameraStream.value.getTracks().forEach((track) => track.stop())
  }

  await store.dispatch('closePeerConnection')

  store.commit('SET_LOCAL_STREAM', null)
  store.commit('SET_REMOTE_STREAM', null)
  createBtnDisabled.value = false
  joinBtnDisabled.value = false
  hangupBtnDisabled.value = true
  currentRoom.value = ''

  if (roomId.value) {
    try {
      const roomRef = doc(db, 'rooms', roomId.value)
      const roomSnapshot = await getDoc(roomRef)
      if (roomSnapshot.exists()) {
        const calleeCandidatesSnapshot = await getDocs(collection(roomRef, 'calleeCandidates'))
        calleeCandidatesSnapshot.forEach(async (candidate) => {
          await deleteDoc(candidate.ref)
        })

        const callerCandidatesSnapshot = await getDocs(collection(roomRef, 'callerCandidates'))
        callerCandidatesSnapshot.forEach(async (candidate) => {
          await deleteDoc(candidate.ref)
        })

        await deleteDoc(roomRef)
      }
    } catch (error) {
      console.error('Error deleting room and candidates:', error)
    }
  }
}

// router.beforeEach((to, from, next) => {
//   if (from.matched.some((record) => record.components.default === this)) {
//     hangUp()
//   }
//   next()
// })

// onBeforeUnmount(() => {
//   hangUp()
// })
</script>

<style scoped></style>