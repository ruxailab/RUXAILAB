<template>
    <ShowInfo>
        <template #content>
            <div class="test-content pa-6 rounded-xl text-center fade-in">
                <h2 class="text-h5 font-weight-bold mb-4 text-primary">
                    ¡Bienvenido a RUXAILAB!
                </h2>
                <p class="text-body-1 mb-4 text-grey-darken-1">
                    Vas a participar en un test de usuario que tiene como objetivo evaluar la facilidad de uso y
                    comprensión de una aplicación digital.
                    Este tipo de test nos ayuda a detectar posibles barreras tecnológicas y mejorar la experiencia de
                    todas las personas.
                </p>
                <h2 class="text-h5 font-weight-bold mb-4 text-primary">
                    ¿Como funciona este test?
                </h2>
                <p class="text-body-1 mb-4 text-grey-darken-1">
                    A lo largo del test, te guiaremos por diferentes fases. En cada una se te indicará con claridad qué
                    debes hacer. No hay respuestas correctas o incorrectas: lo que nos interesa es cómo interactúas con
                    el
                    sistema.
                </p>
                <p class="text-body-1 mb-4 text-grey-darken-1">
                    Aquí puedes ver un resumen de las fases que vas a seguir:
                </p>
                <v-stepper v-if="!smAndDown" :model-value="stepperValue" class="bg-white rounded-xl elevation-3 my-6"
                    style="overflow-y: visible; max-height: none;">
                    <v-stepper-header>
                        <v-stepper-item value="1" title="Consentimiento" />
                        <v-divider />
                        <v-stepper-item value="2" title="Preguntas iniciales" />
                        <v-divider />
                        <v-stepper-item value="3" title="Tareas" />
                        <v-divider />
                        <v-stepper-item value="4" title="Preguntas finales" />
                        <v-divider />
                        <v-stepper-item value="5" title="Envio final" />
                    </v-stepper-header>
                </v-stepper>
                <v-stepper-vertical v-else
                    :items="['Consentimiento informado', 'Preguntas iniciales', 'Tareas', 'Preguntas finales', 'Envio final']"
                    hide-actions class="my-6" />
                <p class="text-body-1 mb-6 text-grey-darken-1">
                    Cuando estés preparado o preparada, pulsa el botón para comenzar. Podrás avanzar a tu ritmo y
                    detenerte en cualquier momento si lo necesitas.
                </p>
                <v-btn color="primary" variant="flat" size="large" @click="$emit('start')">
                    Comenzar el test
                </v-btn>
            </div>
        </template>
    </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import { VStepperVertical } from 'vuetify/labs/VStepperVertical';
import { useDisplay } from 'vuetify';
const props = defineProps({
    stepperValue: { type: Number, required: true },
});
const emit = defineEmits(['start']);
const { smAndDown } = useDisplay();
</script>

<style scoped>
.fade-in {
    animation: fadeIn 2s ease-in-out;
    animation-fill-mode: both;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
