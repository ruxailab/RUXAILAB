<template>
  <div>
    <v-overlay
      v-if="loading"
      v-model="loading"
      class="text-center"
    >
      <v-progress-circular
        indeterminate
        color="#fca326"
        size="50"
      />
      <div class="white-text mt-3">
        {{ $t('HeuristicsCooperators.messages.cooperators_loading') }}
      </div>
    </v-overlay>
    <Intro
      v-if="cooperatorsEdit.length == 0 && intro && !loading && showCoops"
      @close-intro="intro = false"
    />

    <v-row justify="center">
      <v-container class="ma-0 pa-0">
        <Snackbar />
        <!-- Leave alert dialog -->
        <v-dialog
          v-model="dialog"
          width="600"
          persistent
        >
          <LeaveAlert />
        </v-dialog>

        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-btn
              size="large"
              icon
              fixed
              location="bottom right"
              color="#F9A826"
              v-bind="props"
              @click="saveInvitations()"
            >
              <v-icon size="large">
                mdi-email
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('HeuristicsCooperators.actions.send_invitation') }}</span>
        </v-tooltip>

        <ShowInfo :title="$t('HeuristicsCooperators.title.cooperators')">
          <template #content>
            <div
              class="ma-0 pa-0"
              style="background: #f5f7ff"
            >
              <v-chip
                v-for="(coop, i) in selectedCoops"
                :key="i"
                class="ml-2 mt-2"
                closable
                @click:close="removeSelectedCoops(i)"
              >
                {{ typeof coop == 'object' ? coop.email : coop }}
              </v-chip>
              <v-row
                class="ma-0 pa-0 pt-3"
                align="center"
              >
                <v-col
                  class="ma-0 pa-0"
                  cols="12"
                  md="10"
                >
                  <v-combobox
                    :key="comboboxKey"
                    ref="combobox"
                    v-model="comboboxModel"
                    :hide-no-data="false"
                    :autofocus="comboboxKey == 0 ? false : true"
                    style="background: #f5f7ff"
                    :items="users"
                    item-title="email"
                    :label="$t('HeuristicsCooperators.actions.select_cooperator')"
                    multiple
                    variant="outlined"
                    density="compact"
                    color="#fca326"
                    class="mx-2"
                    @update:model-value="validateEmail()"
                  >
                    <template #no-data>
                      {{ $t('HeuristicsCooperators.messages.no_users') }}
                    </template>
                  </v-combobox>
                </v-col>
                <v-col
                  class="ma-0 pa-0"
                  cols="12"
                  md="2"
                >
                  <template #item.accessLevel="{ item }">
                    <v-select
                      :ref="'select' + cooperatorsEdit.indexOf(item)"
                      :key="dataTableKey"
                      v-model="item.accessLevel"
                      color="#fca326"
                      style="max-width: 200px"
                      :items="roleOptions"
                      item-title="text"
                      item-value="value"
                      density="compact"
                      :disabled="!item.invited || item.accepted ? false : true"
                      class="mt-3"
                      @update:model-value="changeRole(item, $event)"
                    />
                  </template>
                </v-col>
              </v-row>
              <v-data-table
                dense
                style="background: #f5f7ff"
                :items="cooperatorsEdit"
                :headers="headers"
                height="450px"
                :items-per-page="7"
                items-per-page-text="7"
                :footer-props="{
                  'items-per-page-options': [7],
                }"
              >
                <!-- Email -->
                <template #item.email="{ item }">
                  <v-row align="center">
                    <v-icon class="mr-2">
                      mdi-account-circle
                    </v-icon>
                    <div>{{ item.email }}</div>
                  </v-row>
                </template>

                <!-- Role -->
                <template #item.accessLevel="{ item }">
                  <v-select
                    :ref="'select' + cooperatorsEdit.indexOf(item)"
                    :key="dataTableKey"
                    color="#fca326"
                    style="max-width: 200px"
                    :model-value="item.accessLevel"
                    return-object
                    density="compact"
                    :items="roleOptions"
                    :v-text="item.accessLevel.text"
                    :disabled="!item.invited || item.accepted ? false : true"
                    class="mt-3"
                    @update:model-value="changeRole(item, $event)"
                  />
                </template>

                <!-- Invited -->
                <template #item.invited="{ item }">
                  <v-icon
                    v-if="item.invited"
                    color="#8EB995"
                  >
                    mdi-checkbox-marked-circle-outline
                  </v-icon>
                  <v-icon
                    v-else
                    color="#F47C7C"
                  >
                    mdi-close-circle-outline
                  </v-icon>
                </template>

                <!-- Accepted -->
                <template #item.accepted="{ item }">
                  <v-icon
                    v-if="item.accepted == null"
                    color="#F9A826"
                  >
                    mdi-checkbox-blank-circle-outline
                  </v-icon>
                  <v-icon
                    v-else-if="item.accepted"
                    color="#8EB995"
                  >
                    mdi-checkbox-marked-circle-outline
                  </v-icon>
                  <v-icon
                    v-else
                    color="#F47C7C"
                  >
                    mdi-close-circle-outline
                  </v-icon>
                </template>

                <!-- More -->
                <template #item.more="{ item }">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        v-bind="props"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item
                        link
                        @click="messageModel = true; selectedUser = item"
                      >
                        <v-list-item-title>
                          {{ $t('HeuristicsCooperators.actions.send_message') }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        v-if="item.accepted == false"
                        link
                        @click="reinvite(item)"
                      >
                        <v-list-item-title>
                          {{ $t('HeuristicsCooperators.actions.reinvite') }}
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item
                        v-if="item.accepted"
                        @click="removeCoop(item)"
                      >
                        <v-list-item-title>
                          {{ $t('HeuristicsCooperators.actions.remove_cooperator') }}
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item
                        v-if="item.invited && !item.accepted"
                        @click="cancelInvitation(item)"
                      >
                        <v-list-item-title>
                          {{ $t('HeuristicsCooperators.actions.cancel_invitation') }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>
            </div>
          </template>
        </ShowInfo>
      </v-container>
    </v-row>
    <AccessNotAllowed v-if="!loading && verified" />
    <div class="text-center">
      <v-dialog
        v-model="messageModel"
        max-width="500"
      >
        <v-card class="rounded-lg">
          <v-card-title
            style="background-color: #F9A826; color: white;"
            class="rounded-top-lg"
          >
            <v-icon
              color="white"
              class="mr-2"
            >
              mdi-email
            </v-icon>
            {{ $t('HeuristicsCooperators.actions.send_message') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="messageTitle"
              required
              :label="$t('HeuristicsCooperators.headers.title')"
              :hint="$t('HeuristicsCooperators.messages.message_title_hint')"
              variant="outlined"
              class="rounded-lg mt-4"
            />
            <v-textarea
              v-model="messageContent"
              required
              :label="$t('HeuristicsCooperators.headers.content')"
              :hint="$t('HeuristicsCooperators.messages.message_content_hint')"
              variant="outlined"
              class="rounded-lg"
            />
          </v-card-text>
          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="red"
              variant="outlined"
              class="rounded-lg"
              @click="messageModel = false"
            >
              {{ $t('HeuristicsCooperators.actions.cancel') }}
            </v-btn>
            <v-btn
              color="orange"
              class="rounded-lg"
              :disabled="!messageTitle.trim() || !messageContent.trim()"
              @click="sendMessage(selectedUser, messageTitle, messageContent)"
            >
              {{ $t('HeuristicsCooperators.actions.send') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import Snackbar from '@/components/atoms/Snackbar.vue'
import Intro from '@/components/molecules/IntroCoops.vue'
import AccessNotAllowed from '@/components/atoms/AccessNotAllowed.vue'
import LeaveAlert from '../../components/atoms/LeaveAlert.vue'
import Notification from '@/models/Notification'
import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator()

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
})

const store = useStore()
const { t } = useI18n()
const toast = useToast()

const object = ref(null)
const intro = ref(null)
const email = ref('')
const selectedCoops = ref([])
const comboboxModel = ref([])
const comboboxKey = ref(0)
const selectedRole = ref(1)
const showCoops = ref(false)
const verified = ref(false)
const dataTableKey = ref(0)
const messageModel = ref(false)
const selectedUser = ref([])
const messageTitle = ref('')
const messageContent = ref('')
const combobox = ref(null)

const dialog = computed(() => store.state.dialog)
const test = computed(() => store.getters.test)
const user = computed(() => store.getters.user)
const users = computed(() => store.state.Users?.users || [])
const cooperatorsEdit = computed(() => test.value?.cooperators ? [...test.value.cooperators] : [])
const loading = computed(() => store.getters.loading)

const headers = computed(() => [
  { title: t('HeuristicsCooperators.headers.email'), value: 'email' },
  { title: t('HeuristicsCooperators.headers.role'), value: 'accessLevel' },
  { title: t('HeuristicsCooperators.headers.invited'), value: 'invited', justify: 'center' },
  { title: t('HeuristicsCooperators.headers.accepted'), value: 'accepted', justify: 'center' },
  { title: t('HeuristicsCooperators.headers.more'), value: 'more', sortable: false }
])

const roleOptions = computed(() => [
  { title: t('HeuristicsCooperators.roles.administrator'), value: 0 },
  { title: t('HeuristicsCooperators.roles.evaluator'), value: 1 },
  { title: t('HeuristicsCooperators.roles.guest'), value: 2 }
])

const removeSelectedCoops = (index) => {
  selectedCoops.value.splice(index, 1)
}

const changeRole = async (item, newValue) => {
  const index = cooperatorsEdit.value.indexOf(item)
  const newCoop = { ...item, accessLevel: newValue }
  
  const currentAccessLevelText = roleOptions.value.find(r => r.value === item.accessLevel).text
  const newAccessLevelText = roleOptions.value.find(r => r.value === newValue).text

  if (item.accessLevel !== newValue) {
    const ok = confirm(
      t('HeuristicsCooperators.messages.change_role', {
        email: item.email,
        old: currentAccessLevelText,
        new: newAccessLevelText
      })
    )
    if (ok) {
      test.value.cooperators[index] = newCoop
      await store.dispatch('updateTest', test.value)
      await store.dispatch('updateUserAnswer', {
        testDocId: test.value.id,
        cooperatorId: newCoop.userDocId,
        data: { accessLevel: newCoop.accessLevel }
      })
    } else {
      dataTableKey.value++
    }
  }
}

const submit = async () => {
  test.value.cooperators = [...cooperatorsEdit.value]
  await store.dispatch('updateTest', test.value)
  cooperatorsEdit.value.forEach((guest) => {
    if (!guest.accepted) {
      notifyCooperator(guest)
    }
  })
  selectedCoops.value = []
  combobox.value?.blur()
}

const notifyCooperator = (guest) => {
  if (guest.userDocId) {
    const path = guest.accessLevel.value >= 2 ? 'testview' : 'managerview'
    store.dispatch('addNotification', {
      userId: guest.userDocId,
      notification: new Notification({
        title: 'Cooperation Invite!',
        description: `You have been invited to test ${test.value.testTitle}!`,
        redirectsTo: `${path}/${test.value.id}/${guest.token}`,
        author: test.value.testAdmin.email,
        read: false,
        testId: test.value.id,
        accessLevel: roleOptions.value[selectedRole.value].value
      })
    })
  }
}

const sendMessage = (user, title, content) => {
  if (user.userDocId) {
    const path = user.accessLevel.value >= 2 ? 'testview' : 'managerview'
    store.dispatch('addNotification', {
      userId: user.userDocId,
      notification: new Notification({
        title: title,
        description: content,
        redirectsTo: '/',
        read: false,
        author: test.value.testAdmin.email,
        testId: test.value.id
      })
    })
  }
  messageModel.value = false
  messageTitle.value = ''
  messageContent.value = ''
}

const reinvite = (guest) => {
  notifyCooperator(guest)
}

const saveInvitations = () => {
  const tokens = {}
  selectedCoops.value.forEach((coop) => {
    const token = uidgen.generateSync()
    if (!coop.id) {
      cooperatorsEdit.value.push({
        userDocId: null,
        email: coop,
        invited: true,
        accepted: false,
        accessLevel: roleOptions.value[selectedRole.value].value,
        token,
        progress: 0,
        updateDate: test.value.updateDate,
        testAuthorEmail: test.value.testAdmin.email
      })
    } else {
      cooperatorsEdit.value.push({
        userDocId: coop.id,
        email: coop.email,
        invited: true,
        accepted: false,
        accessLevel: roleOptions.value[selectedRole.value].value,
        token,
        progress: 0,
        updateDate: test.value.updateDate,
        testAuthorEmail: test.value.testAdmin.email
      })
    }
    tokens[coop.id || coop] = token
  })
  submit()
}

const validateEmail = () => {
  email.value = comboboxModel.value.pop()
  comboboxKey.value++
  if (typeof email.value !== 'object' && email.value !== undefined) {
    if (email.value.length) {
      if (!email.value.includes('@') || !email.value.includes('.')) {
        toast.error(t('errors.globalError'))
      }
      if (!users.value.find(user => user.email === email.value)) {
        toast.error(`${email.value} is not a valid email or does not exist`)
        return
      } else if (!selectedCoops.value.includes(email.value)) {
        selectedCoops.value.push(email.value)
      }
    }
  } else if (!selectedCoops.value.includes(email.value)) {
    const alreadyInvited = cooperatorsEdit.value.find(
      cooperator => cooperator.email === email.value.email
    )
    if (alreadyInvited) {
      toast.warning(`${email.value.email} has already been invited`)
      return
    } else {
      selectedCoops.value.push(email.value)
    }
  }
}

const removeCoop = async (coop) => {
  const ok = confirm(
    t('HeuristicsCooperators.messages.remove_cooperator', { email: coop.email })
  )
  if (ok) {
    const index = cooperatorsEdit.value.indexOf(coop)
    cooperatorsEdit.value.splice(index, 1)
    test.value.cooperators = cooperatorsEdit.value
    test.value.numberColaborators = test.value.numberColaborators - 1
    await store.dispatch('updateTest', test.value)
    await store.dispatch('removeTestFromCooperator', {
      test: test.value,
      cooperator: coop
    })
  }
}

const sendInvitationMail = async (guest) => {
  let domain = window.location.href
  domain = domain.replace(window.location.pathname, '')
  let email = {
    testId: test.value.id,
    from: user.value.email,
    testTitle: test.value.testTitle,
    guest,
    domain
  }
  if (guest.accessLevel === 1) {
    email = { ...email, path: 'testview', token: guest.token }
  } else {
    email = { ...email, path: 'managerview', token: guest.token }
  }
  await store.dispatch('sendEmailInvitation', email)
}

const cancelInvitation = async (guest) => {
  const ok = confirm(
    t('HeuristicsCooperators.messages.cancel_invitation', { email: guest.email })
  )
  if (ok) {
    const index = cooperatorsEdit.value.indexOf(guest)
    cooperatorsEdit.value.splice(index, 1)
    test.value.cooperators = cooperatorsEdit.value
    await store.dispatch('updateTest', test.value)
  }
}

watch(loading, (newVal) => {
  if (!newVal) {
    intro.value = cooperatorsEdit.value.length === 0
  }
})

onMounted(() => {
  store.dispatch('getAllUsers')
})
</script>

<style scoped>
.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}
.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
</style>