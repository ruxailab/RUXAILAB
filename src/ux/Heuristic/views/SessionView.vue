<template>
    <div style="height: calc(100vh - 64px); overflow: auto;">
        <v-overlay :model-value="loading" class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="64" color="orange" />
        </v-overlay>
        <div v-if="testAnswerDocument && testAnswerDocument.type === 'User'" style="height:100%">
            <UserTestSession />
        </div>
        <div v-else-if="testAnswerDocument">
            <h1>Not Avalaible Yet For Non User Test</h1>
        </div>
    </div>
</template>


<script setup>
import UserTestSession from '@/components/organisms/UserTestSession.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const loading = computed(() => store.getters.loading);

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument || null)
</script>

<style></style>
