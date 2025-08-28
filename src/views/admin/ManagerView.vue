<template>
  <router-view />
  <v-container
    class="pa-0 ma-0"
    fluid
  >
    <v-overlay
      v-if="$route.path.includes('manager')"
      v-model="loading"
      class="text-center"
    >
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      />
      <div class="white-text mt-3">
        {{ $t('common.loading') }}
      </div>
    </v-overlay>

    <v-dialog
      :model-value="flagToken && flagUser && !logined"
      width="500"
      persistent
    >
      <v-card>
        <v-row
          class="ma-0 pa-0 pt-5"
          justify="center"
        >
          <v-avatar
            class="justify-center"
            color="orange-lighten-4"
            size="150"
          >
            <v-icon size="120">
              mdi-account
            </v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn
            class="text-white bg-orange"
            @click="setTest"
          >
            {{ $t('common.continueAs') }} {{ user.email }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            {{ $t('common.notUser', { userEmail: user.email }) }}
            <a
              style="color: #f9a826"
              @click="signOut"
            >{{
              $t('common.changeAccount')
            }}</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <template v-if="test">
      <Drawer
        v-if="mdAndUp"
        :items="navigator"
      />
      <v-container
        fluid
        :class="['background pa-0 ma-0', { 'pl-drawer': mdAndUp }]"
        style="min-height: 100vh; overflow-y: auto"
      >
        <template v-if="$route.path.includes('manager')">
          <div v-if="accessLevel == 0">
            <p class="presentation-text text-center text-md-left mb-4">
              {{ $t('common.editAndInvite') }}
            </p>
            <CardsManager :cards="topCards" :per-row="mdAndUp ? 2 : 1" @click="go" />
          </div>

          <div v-if="accessLevel == 0" class="mt-10">
            <p class="presentation-text text-center text-md-left mb-4">
              {{ $t('common.analyzeProject') }}
            </p>
            <CardsManager :cards="bottomCards" :per-row="mdAndUp ? 3 : 1" @click="go" />
          </div>
        </template>
      </template>

      <template #content>
        <router-view v-if="!$route.path.includes('manager')" />
      </template>
    </ManagerLayout>
  </template>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { statistics } from '@/utils/statistics'
import { useDisplay } from 'vuetify'
import Drawer from '@/components/atoms/Drawer.vue'
import CardsManager from '@/components/atoms/CardsManager'
import ManagerLayout from '@/components/layouts/ManagerLayout.vue'
import { useManagerTestCards } from '@/composables/useManagerTestCards'

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToast()
const { mdAndUp } = useDisplay()

const flagUser = ref(false)
const flagToken = ref(false)
const flagNewUser = ref(false)
const logined = ref(false)
const token = ref('')

const test = computed(() => {
  const testData = store.getters.test
  if (!testData) return null
  store.dispatch('processStatistics', {
    resultEvaluator: statistics(),
    percentage: store.getters.percentage,
    answers: store.getters.testAnswerDocument,
  })
  return testData
})

const user = computed(() => store.getters.user)

const cooperators = computed(() => store.getters.cooperators)
const loading = computed(() => store.getters.loading)

const accessLevel = computed(() => {
  if (!user.value) return 1
  if (user.value.accessLevel === 0) return 0
  const isTestOwner = test.value?.testAdmin?.userDocId === user.value.id
  if (isTestOwner) return 0
  const coopsInfo = test.value?.cooperators?.find(
    (coops) => coops.userDocId === user.value.id
  )
  if (coopsInfo) return coopsInfo.accessLevel
  return test.value?.isPublic ? 1 : 2
})

// Use the specialized composable for test cards
const { topCards, bottomCards } = useManagerTestCards(test, accessLevel)

const navigator = computed(() => {
  if (!test.value) return []
  const items = [
    { title: 'Manager', icon: 'mdi-home', path: `/managerview/${test.value.id}` },
  ]
  if (test.value.template) {
    items.push({
      title: 'Template',
      icon: 'mdi-file-compare',
      path: `/templateview/${test.value.template.id}`,
    })
  }
  if (accessLevel.value === 0) {
    items.push(
      { title: 'Test', icon: 'mdi-file-document-edit', path: `/edittest/${test.value.id}` },
      { title: 'Preview', icon: 'mdi-file-eye', path: `/testview/${test.value.id}` },
      { title: 'Reports', icon: 'mdi-book-multiple', path: `/reportview/${test.value.id}` },
      {
        title: 'Answers',
        icon: 'mdi-order-bool-ascending-variant',
        path: `/answerview/${test.value.id}`,
      },
      {
        title: 'Final Report',
        icon: 'mdi-file-document',
        path: `/finalreportview/${test.value.id}`,
      },
      {
        title: 'Cooperators',
        icon: 'mdi-account-group',
        path: `/cooperators/${test.value.id}`,
      },
      { title: 'Settings', icon: 'mdi-cog', path: `/settingsview/${test.value.id}` }
    )
  }
  if (accessLevel.value === 1) {
    items.push(
      {
        title: 'Answer Test',
        icon: 'mdi-file-document',
        path: `/testview/${test.value.id}`,
      },
      { title: 'Reports', icon: 'mdi-book-multiple', path: `/reportview/${test.value.id}` },
      {
        title: 'Answers',
        icon: 'mdi-order-bool-ascending-variant',
        path: `/answerview/${test.value.id}`,
      }
    )
  }
  return items
})

const go = (path) => {
  router.push(path).catch(() => { })
}

const signOut = async () => {
  await store.dispatch('logout')
  flagUser.value = false
}

const setTest = async () => {
  if (user.value.myAnswers && test.value) {
    const answers = Object.entries(user.value.myAnswers).map(([, value]) => value)
    const alreadyAccepted = answers.find((a) => a.testDocId === test.value.id)
    if (!alreadyAccepted) {
      const invitation = test.value.cooperators.find((coop) => coop.token === token.value)
      if (invitation) {
        if (user.value.email === invitation.email) {
          await store.dispatch('acceptTestCollaboration', {
            test: test.value,
            cooperator: user.value,
          })
          flagToken.value = false
          logined.value = true
        } else {
          store.commit('setError', {
            errorCode: 'inviteError',
            message: t('errors.signupWithInvitationEmail'),
          })
          await store.dispatch('logout')
          router.push({ path: '/' })
        }
      } else {
        store.commit('setError', {
          errorCode: 'inviteError',
          message: t('errors.invalidInvitation'),
        })
        router.push({ path: '/' })
      }
    } else {
      flagToken.value = false
    }
  }
}

onBeforeMount(async () => {
  if (route.params.token) {
    flagToken.value = true
    token.value = route.params.token
  }

  if (user.value) {
    flagUser.value = true
  }

  await store.dispatch('getTest', { id: route.params.id })

  if (!store.getters.test) {
    toast.error('Test data could not be loaded.')
    router.push('/testslist')
    return
  }

  await store.dispatch('getCurrentTestAnswerDoc')

  if (accessLevel.value === 2) {
    toast.warning("You don't have permission to access this test!")
    router.push('/testslist')
  }
})

watch(user, () => {
  if (user.value) {
    flagUser.value = true
    if (flagToken.value && !logined.value) {
      setTest()
    }
  }
})
</script>

<style>
/* Keep only ManagerView specific styles */
.nav {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.testTitle {
  font-style: normal;
  font-weight: bold;
  font-size: 45px;
  display: flex;
  align-items: center;
  text-align: center;
  text-shadow: 2px 2px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.text-div {
  max-width: 45%;
}

.bottom-cards {
  margin: 0;
}

@media screen and (max-width: 960px) {
  .text-div {
    max-width: 100%;
    margin: 0px 10px;
    text-justify: center;
  }

  .image-back {
    height: 300px;
  }

  .mobile-center {
    display: flex;
    text-align: center;
    justify-content: center;
  }
}

.cards-animation {
  box-shadow: 0;
  transition: box-shadow 0.5s;
}

.cards-animation:hover {
  box-shadow: 0px 0px 35px 2px rgba(0, 0, 0, 0.7) !important;
}
</style>