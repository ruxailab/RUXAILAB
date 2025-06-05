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


defineProps({
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
  createBtnDisabled.value = true
  joinBtnDisabled.value = true
  roomCollection.value = collection(db, 'rooms')
  const roomRef = doc(roomCollection.value, roomTestId.value)
  await store.dispatch('createPeerConnection', {
    configuration: configuration.value,
  })

  localCameraStream.value.getTracks().forEach((track) => {
    videoSender.value = peerConnection.value.addTrack(track, localCameraStream.value)
  })

  const callerCandidatesCollection = collection(roomRef, 'callerCandidates')
  peerConnection.value.addEventListener('icecandidate', (event) => {
    if (!event.candidate) {
      return
    }
    addDoc(callerCandidatesCollection, event.candidate.toJSON())
  })

  const offer = await peerConnection.value.createOffer()
  await peerConnection.value.setLocalDescription(offer)
  const roomWithOffer = {
    offer: {
      type: offer.type,
      sdp: offer.sdp,
    },
  }
  await setDoc(roomRef, roomWithOffer)
  roomId.value = roomRef.id
  currentRoom.value = `Current room is ${roomRef.id} - You are the caller!`

  peerConnection.value.addEventListener('track', (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteCameraStream.value.addTrack(track)
    })
  })

  onSnapshot(roomRef, async (snapshot) => {
    const data = snapshot.data()
    if (!peerConnection.value.currentRemoteDescription && data && data.answer) {
      const rtcSessionDescription = new RTCSessionDescription(data.answer)
      await peerConnection.value.setRemoteDescription(rtcSessionDescription)
    }
  })

  onSnapshot(collection(roomRef, 'calleeCandidates'), (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const data = change.doc.data()
        await peerConnection.value.addIceCandidate(new RTCIceCandidate(data))
      }
    })
  })

  peerConnection.value.addEventListener('connectionstatechange', () => {
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

  if (roomSnapshot.exists()) {
    await store.dispatch('createPeerConnection', {
      configuration: configuration.value,
    })
    const localStream = localCameraStream.value
    localStream.getTracks().forEach((track) => {
      videoSender.value = peerConnection.value.addTrack(track, localStream)
    })

    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates')
    peerConnection.value.addEventListener('icecandidate', async (event) => {
      if (!event.candidate) {
        return
      }
      await addDoc(calleeCandidatesCollection, event.candidate.toJSON())
    })

    peerConnection.value.addEventListener('track', (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (remoteCameraStream.value) {
          remoteCameraStream.value.addTrack(track)
        }
      })
    })

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

    onSnapshot(collection(roomRef, 'callerCandidates'), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data()
          await peerConnection.value.addIceCandidate(new RTCIceCandidate(data))
        }
      })
    })
  }

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
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 360, max: 720 },
      },
      audio: true,
    })
    if (stream) {
      emitConfirm()
      store.commit('SET_LOCAL_STREAM', stream)
      store.commit('SET_REMOTE_STREAM', new MediaStream())
      createBtnDisabled.value = false
      joinBtnDisabled.value = false
      hangupBtnDisabled.value = false

      if (isAdmin) {
        await createRoom()
      } else {
        await joinRoomById(roomTestId.value)
      }
    }
  } catch (e) {
    toast.error(t('errors.globalError'))
  }
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

router.beforeEach((to, from, next) => {
  if (from.matched.some((record) => record.components.default === this)) {
    hangUp()
  }
  next()
})

onBeforeUnmount(() => {
  hangUp()
})
</script>

<style scoped></style>