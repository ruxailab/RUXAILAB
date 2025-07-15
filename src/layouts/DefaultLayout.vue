<template>
    <v-app>
        <Toolbar />
        <GlobalErrorHandler />
        <v-main>
            <v-container fluid class="pa-0">
                <slot />
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import Toolbar from '@/components/molecules/Toolbar.vue'
import GlobalErrorHandler from '@/components/atoms/GlobalErrorHandler.vue'

export default {
    components: {
        Toolbar,
        GlobalErrorHandler,
    },
}
</script>
