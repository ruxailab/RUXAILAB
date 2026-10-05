<template>
  <v-app-bar density="comfortable" color="#00213F" padding="10px !important">
    <v-btn
      v-if="user"
      icon
      class="d-flex d-lg-none"
      :aria-label="$t('navigation.appNavigation')"
      @click="toggleDashboardDrawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- Logo y título -->
    <v-toolbar-title
      style="cursor: pointer"
      class="d-flex align-center"
      @click="goTo('/admin')"
    >
      <img
        :src="xs ? logoSmall : logoFull"
        alt="RUXAILAB Logo"
        :height="xs ? '30' : '25'"
        :class="xs ? 'mr-1 align-self-center' : 'mr-3 align-self-center'"
        style="vertical-align: middle"
      />
    </v-toolbar-title>

    <div
      v-if="isStudyManagerRoute && currentStudy"
      class="study-context"
      :title="studyContextTitle"
    >
      <template v-if="studyTypeLabel || studySubtypeLabel">
        <span v-if="studyTypeLabel" class="study-context__method">
          {{ studyTypeLabel }}
        </span>

        <template v-if="studySubtypeLabel">
          <span class="study-context__separator">·</span>

          <span class="study-context__method">
            {{ studySubtypeLabel }}
          </span>
        </template>

        <span class="study-context__separator">·</span>
      </template>

      <span class="study-context__title">
        {{ currentStudy.testTitle || $t('navigation.appNavigation') }}
      </span>
    </div>

    <v-spacer />

    <locale-changer />

    <v-btn
      v-if="$route.path === '/' && user"
      variant="text"
      color="#f9a826"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/admin')"
    >
      {{ $t('buttons.goToConsole') }}
    </v-btn>

    <v-btn
      v-if="!['/', '/admin', '/signin', '/signup'].includes($route.path)"
      variant="text"
      color="#ff5c6d"
      class="console-button mx-1 d-none d-lg-flex"
      @click="goTo('/admin')"
    >
      {{ $t('buttons.returnToConsole') }}
    </v-btn>

    <!-- Botones de herramientas -->
    <HelpButton :class="smAndDown ? 'mx-1' : 'mx-2'" />
    <NotificationButton v-if="user" :class="smAndDown ? 'mx-1' : 'mx-2'" />

    <!-- Autenticación -->
    <v-btn
      v-if="!user"
      variant="text"
      class="d-none d-lg-flex"
      @click="goTo('/signin')"
    >
      <v-icon start> mdi-lock </v-icon>
      {{ $t('auth.SIGNIN.sign-in') }}
    </v-btn>

    <v-btn
      v-if="!user"
      icon
      class="d-flex d-lg-none"
      :aria-label="$t('auth.SIGNIN.sign-in')"
      @click="goTo('/signin')"
    >
      <v-icon :size="iconSize"> mdi-lock </v-icon>
    </v-btn>

    <!-- Menú de usuario -->
    <UserMenu v-if="user" />
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import {
  getMethodName,
  normalizeStudyType,
  STUDY_TYPES,
} from '@/shared/constants/methodDefinitions'
import LocaleChanger from '@/features/language/components/LocaleChanger.vue'
import HelpButton from '@/features/navigation/components/HelpButton.vue'
import UserMenu from './UserMenu.vue'
import NotificationButton from './NotificationButton.vue'
import logoFull from '@/assets/logo_full_white.png'
import logoSmall from '@/assets/logo_small_red.png'

// Emits
defineEmits(['toggle-mobile-drawer', 'toggle-dashboard-drawer'])

// Composables
const router = useRouter()
const route = useRoute()
const store = useStore()
const { smAndDown, xs } = useDisplay()
const { t, locale } = useI18n()

// Computed
const user = computed(() => store.getters.user)
const iconSize = computed(() => (smAndDown.value ? '18' : '20'))

const currentStudy = computed(() => store.getters.test)

const isStudyManagerRoute = computed(() =>
  route.matched.some(
    ({ name }) => typeof name === 'string' && name.endsWith('ManagerView'),
  ),
)

const methodLanguage = computed(() =>
  locale.value.startsWith('en') ? 'en' : 'es',
)

const studyTypeLabel = computed(() => {
  const study = currentStudy.value
  if (!study?.testType) return ''

  if (normalizeStudyType(study.testType) === STUDY_TYPES.USER) {
    return t('methods.categories.test')
  }

  return getMethodName({ ...study, subType: '' }, methodLanguage.value)
})

const studySubtypeLabel = computed(() => {
  const study = currentStudy.value
  const subtype = study?.subType
  if (!subtype) return ''

  if (normalizeStudyType(study.testType) === STUDY_TYPES.USER) {
    return getMethodName(study, methodLanguage.value)
  }

  if (subtype === 'QUALITATIVE' || subtype === 'QUANTITATIVE') {
    return t(`Dashboard.cards.${subtype.toLowerCase()}`)
  }

  return subtype
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
})

const studyContextTitle = computed(() => {
  const parts = [
    studyTypeLabel.value,
    studySubtypeLabel.value,
    currentStudy.value?.testTitle,
  ].filter(Boolean)

  return parts.join(' · ')
})

// Methods
const goTo = (path) => {
  if (path.includes('/testview')) {
    window.open(path)
  } else {
    router.push(path).catch(() => {})
  }
}

const toggleDashboardDrawer = () => {
  // Emitir evento para que lo capture el layout o componente padre
  const event = new CustomEvent('toggle-dashboard-drawer')
  window.dispatchEvent(event)
}
</script>

<style scoped>
.console-button {
  text-transform: none !important;
  letter-spacing: normal !important;
}

.study-context {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 700px;
  margin-left: 4px;
  overflow: hidden;
  white-space: nowrap;
}

.study-context__title {
  min-width: 0;
  overflow: hidden;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  text-overflow: ellipsis;
}

.study-context__method {
  flex-shrink: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  text-overflow: ellipsis;
}

.study-context__separator {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.85rem;
}

:deep(.v-toolbar__content) {
  padding-right: 20px;
  padding-left: 10px;
}

@media (max-width: 600px) {
  .study-context {
    flex: 1 1 0;
    gap: 4px;
    margin-left: 2px;
  }

  .study-context__title {
    font-size: 0.8rem;
  }

  .study-context__method,
  .study-context__separator {
    font-size: 0.75rem;
  }

  :deep(.v-toolbar__content) {
    padding-right: 4px;
    padding-left: 4px;
  }
}
</style>
