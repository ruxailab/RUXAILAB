<template>
  <div>
    <Loadding />

    <v-row justify="center">
      <v-container class="pa-0">
        <Snackbar />

        <v-dialog v-model="dialog" width="600" persistent>
          <LeaveAlert />
        </v-dialog>

        <ShowInfo title="Cooperators">
          <template #content>
            <div class="ma-0 pa-0" style="background: #f5f7ff;">
              <v-row class="ma-0 pa-0 pt-3" align="center">
                <v-col class="mt-1 mx-4 pa-0">
                  <v-combobox v-model="comboboxModel" ref="combobox" style="background: #f5f7ff;" :items="users"
                    item-title="email" label="Select cooperator" variant="outlined" rounded density="compact"
                    color="#fca326" class="mx-2" placeholder="Select an Email" @update:model-value="verifyEmail()">
                    <template #no-data>
                      There are no users registered with that email, press enter
                      to select anyways.
                    </template>
                  </v-combobox>
                </v-col>
              </v-row>

              <v-card class="mx-6" border>
                <v-data-table style="background: #f5f7ff" :items="cooperatorsEdit" :headers="headers" height="450px"
                  :items-per-page="7" items-per-page-text="7" :footer-props="{
                    'items-per-page-options': [7],
                  }">
                  <!-- Email -->
                  <template #item.email="{ item }">
                    <v-row class="ml-3" aling="center">
                      <div>{{ item.email }}</div>
                    </v-row>
                  </template>

                  <!-- Invited -->
                  <template #item.invited="{ item }">
                    <v-icon v-if="item.invited" color="#8EB995">
                      mdi-checkbox-marked-circle-outline
                    </v-icon>
                    <v-icon v-else color="#F47C7C">
                      mdi-close-circle-outline
                    </v-icon>
                  </template>

                  <!-- Accepted -->
                  <template #item.accepted="{ item }">
                    <v-icon v-if="item.accepted == null" color="#F9A826">
                      mdi-checkbox-blank-circle-outline
                    </v-icon>
                    <v-icon v-else-if="item.accepted" color="#8EB995">
                      mdi-checkbox-marked-circle-outline
                    </v-icon>
                    <v-icon v-else color="#F47C7C">
                      mdi-close-circle-outline
                    </v-icon>
                  </template>

                  <!-- More -->
                  <template #item.more="{ item }">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn icon v-bind="props">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-item link @click="messageModel = true; selectedUser = item">
                          <v-list-item-title>Send a message</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="item.accepted == false" link @click="reinvite(item)">
                          <v-list-item-title>Re-invite</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="item.accepted" @click="removeCoop(item)">
                          <v-list-item-title>Remove cooperator</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="item.invited && !item.accepted" @click="cancelInvitation(item)">
                          <v-list-item-title>Cancel invitation</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-data-table>
              </v-card>
            </div>
          </template>
        </ShowInfo>
      </v-container>

      <ButtonSend :disabled="verifyEmail(true)" @click="saveInvitation()" />
    </v-row>
  </div>
</template>

<script setup>
import ButtonSend from '@/components/atoms/ButtonSend.vue'
import LeaveAlert from '@/components/atoms/LeaveAlert.vue'
import Loadding from '@/components/atoms/Loadding.vue'
import Snackbar from '@/components/atoms/Snackbar.vue'
import ShowInfo from '@/components/organisms/ShowInfo.vue'
import Notification from '@/shared/models/Notification'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

// Variables
const selectedUser = ref({})
const combobox = ref(null)
const comboboxModel = ref(null)
const messageModel = ref(false)
const headers = ref([
  { title: 'Email', value: 'email' },
  { title: 'Invited', value: 'invited', justify: 'center' },
  { title: 'Accepted', value: 'accepted', justify: 'center' },
  { title: 'More', value: 'more', sortable: false },
])

// Store
const store = useStore()
const toast = useToast()

// Computeds
const dialog = computed(() => store.state.dialog)
const user = computed(() => store.getters.user)
const users = computed(() => store.state.Users.users || [])
const test = computed(() => store.getters.test)
const cooperatorsEdit = computed(() =>
  test.value.cooperators ? [...test.value.cooperators] : []
)

// Methods
const verifyEmail = (isButton = false) => {
  if (comboboxModel.value === null) return true
  if (!comboboxModel.value || typeof comboboxModel.value !== 'object') return true
  const alreadyInvited = cooperatorsEdit.value.find((c) => c.email === comboboxModel.value.email)

  if (alreadyInvited) {
    if (isButton) return true
    toast.warning(`${comboboxModel.value.email} has already been invited`);
  }

  return false
}

const reinvite = async (guest) => {
  await notifyCooperator(guest)
}

const removeCoop = async (coop) => { }

const cancelInvitation = async (coop) => {
  const ok = confirm(`Are you sure you want to cancel the invitation for ${coop.email}?`)
  if (!ok) return

  const index = cooperatorsEdit.value.indexOf(coop)
  cooperatorsEdit.value.splice(index, 1)
  test.value.cooperators = cooperatorsEdit.value
  await store.dispatch('updateTest', test.value)
}

const saveInvitation = async () => {
  const cooperator = comboboxModel.value

  cooperatorsEdit.value.push({
    userDocId: cooperator.id || null,
    email: cooperator.email,
    invited: true,
    accepted: false,
    accessLevel: 1,
    updateDate: test.value.updateDate,
    testAuthorEmail: test.value.testAdmin.email,
  })

  await submit()
}

const submit = async () => {
  test.value.cooperators = [...cooperatorsEdit.value]
  await store.dispatch('updateTest', test.value)
  cooperatorsEdit.value.forEach((guest) => {
    if (!guest.accepted) {
      notifyCooperator(guest)
    }
  })

  comboboxModel.value = null
  combobox.value.blur()
}

const notifyCooperator = async (guest) => {
  if (guest.userDocId) {
    const path = 'testview'
    await store.dispatch('addNotification', {
      userId: guest.userDocId,
      notification: new Notification({
        title: 'Cooperation Invite!',
        description: `You have been invited to test ${test.value.testTitle}!`,
        redirectsTo: `cardSorting/${path}/${test.value.id}/${guest.userDocId}`,
        author: test.value.testAdmin.email,
        read: false,
        testId: test.value.id,
        accessLevel: 1
      })
    })
  }

  sendInvitationMail(guest)
}

const sendInvitationMail = async (guest) => {
  let domain = window.location.href
  domain = domain.replace(window.location.pathname, '')
  let email = {
    testId: test.value.id,
    from: user.value.email,
    testTitle: test.value.testTitle,
    guest,
    domain,
  }
  if (guest.accessLevel === 1) {
    email = Object.assign(email, {
      path: 'testview',
      token: guest.userDocId,
    })
  } else {
    email = Object.assign(email, {
      path: 'managerview',
      token: guest.userDocId,
    })
  }
  await store.dispatch('sendModeratedEmailInvitation', email)
}

// Mounted
onMounted(async () => {
  await store.dispatch('getAllUsers')
})
</script>

<style scoped>
.v-dialog {
  border-radius: 20px !important;
}
</style>
