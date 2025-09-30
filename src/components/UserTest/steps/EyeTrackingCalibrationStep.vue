<template>

    <CalibrationInProgressModal @close="emit('closeCalibration')" @openCalibration="emit('openCalibration')"
        :isOpen="calibrationInProgress" :isCompleted="calibrationCompleted" />
    <ShowInfo title="Calibración de Eye Tracking">
        <template #content>
            <div class="test-content pa-6 rounded-xl text-center">
                <v-icon size="96" color="primary">mdi-eye</v-icon>
                <h2 class="text-h5 font-weight-bold mt-4 text-secondary">
                    Antes de comenzar la calibración
                </h2>
                <p class="text-body-1 mt-4 mb-4 text-grey-darken-1">
                    Vamos a preparar tu dispositivo para <strong>registrar el movimiento de tus ojos</strong>.
                    Esto nos permitirá entender cómo navegas por la pantalla durante el test.
                </p>
                <p class="text-body-1 mb-4 text-grey-darken-1">
                    La calibración consiste en seguir con la mirada unos puntos que aparecerán en la pantalla.
                    Es importante que te sitúes en un lugar bien iluminado, te sientes cómodamente y mantengas la cabeza
                    estable.
                </p>
                <p class="text-body-1 mb-6 text-grey-darken-1">
                    Cuando estés listo o lista, pulsa el botón para empezar la calibración.
                </p>
                <StartCalibrationButton :calibrationInProgress="calibrationInProgress"
                    @openCalibration="emit('openCalibration')" />
            </div>
        </template>
    </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue';
import CalibrationInProgressModal from '@/ux/UserTest/components/CalibrationInProgressModal.vue';
import StartCalibrationButton from '@/ux/UserTest/components/StartCalibrationButton.vue';

const emit = defineEmits(['done', 'openCalibration', 'closeCalibration']);

const props = defineProps({
    calibrationInProgress: {
        type: Boolean,
        default: false
    },
    calibrationCompleted: {
        type: Boolean,
        default: false
    }
});

</script>
