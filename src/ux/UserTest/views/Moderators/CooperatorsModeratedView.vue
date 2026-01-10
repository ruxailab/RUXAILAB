<template>
  <div>
    <CooperatorsView :has-role-column="false" :show-date-columns="true" :show-session-column="true">
      <template #dialog="{ isDrawerOpen, setDrawerOpen }">
        <CreateInviteDialog 
          :dialog="isDrawerOpen" 
          @update:dialog="setDrawerOpen" 
        />
      </template>
    </CooperatorsView>
  </div>
</template>

<script setup>
import CooperatorsView from '@/shared/views/CooperatorsView.vue';
import CreateInviteDialog from '@/ux/UserTest/components/dialogs/CreateInviteDialog.vue';
</script>
