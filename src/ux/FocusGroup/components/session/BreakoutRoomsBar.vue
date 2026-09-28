<template>
  <!-- Staff-facing strip (facilitator + observer): drop into any breakout
       room's video/audio to check in, and see which rooms have called for
       help. Separate from the facilitator-only BreakoutPanel, which manages
       the split itself. -->
  <div v-if="breakout?.active" class="fg-rooms-bar">
    <v-icon size="16" class="me-1">mdi-call-split</v-icon>
    <span class="fg-rooms-bar__title">
      {{ t('focusGroup.session.breakoutStaffRoomsTitle') }}
    </span>

    <div class="fg-rooms-bar__groups">
      <v-btn
        v-for="(group, groupId) in breakout.groups"
        :key="groupId"
        size="small"
        class="text-none"
        :color="roomColor(groupId, group)"
        :variant="visitingGroupId === groupId ? 'flat' : 'outlined'"
        @click="emit('visit', groupId)"
      >
        <v-icon
          v-if="group.help"
          start
          size="16"
          class="fg-rooms-bar__help-icon"
        >
          mdi-hand-back-left
        </v-icon>
        {{ group.name }}
        <span class="ms-1 text-caption">
          ({{ (group.participantIds || []).length }})
        </span>
      </v-btn>
    </div>

    <v-spacer />

    <v-btn
      v-if="visitingGroupId"
      size="small"
      variant="tonal"
      prepend-icon="mdi-arrow-left"
      class="text-none"
      @click="emit('returnToMain')"
    >
      {{ t('focusGroup.session.breakoutReturnToMain') }}
    </v-btn>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // Full breakout state from RTDB, or null when no breakout has ever run.
  breakout: { type: Object, default: null },
  // The group the staff member is currently dropped into (null = main room).
  visitingGroupId: { type: String, default: null },
})

const emit = defineEmits(['visit', 'returnToMain'])

// The room the staff member is in wins; a room asking for help is flagged in
// red so it stands out; everything else stays neutral.
const roomColor = (groupId, group) => {
  if (props.visitingGroupId === groupId) return 'primary'
  if (group?.help) return 'error'
  return undefined
}
</script>

<style scoped>
.fg-rooms-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.fg-rooms-bar__title {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.75;
}

.fg-rooms-bar__groups {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.fg-rooms-bar__help-icon {
  animation: fg-help-pulse 1.2s ease-in-out infinite;
}

@keyframes fg-help-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
</style>
