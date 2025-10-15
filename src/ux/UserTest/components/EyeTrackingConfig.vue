<template>
    <div>
        <v-container>
            <v-row justify="center" align="start">
                <v-col cols="12" lg="6" md="6">
                    <GeneralConfigCard />
                </v-col>
                <v-col cols="12" lg="6" md="6">
                    <MiscConfigCard />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import GeneralConfigCard from "../calibration/GeneralConfigCard.vue";
import MiscConfigCard from "../calibration/MiscConfigCard.vue";


export default {
    components: {
        GeneralConfigCard,
        MiscConfigCard,
    }
};
</script>