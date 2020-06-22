<template>
  <v-row>
    <v-btn v-if="step > 1" large fab fixed bottom left elevation="24" dark @click="$emit('backStep')">
      <v-icon>mdi-arrow-left-drop-circle</v-icon>
    </v-btn>

    <v-content v-if="step == size">
      <v-speed-dial
        v-if="create == null || create == undefined"
        v-model="fab"
        fixed
        bottom
        right
        elevation="24"
        open-on-hover
        direction="top"
        transition="scale"
      >
        <template v-slot:activator>
          <v-btn v-model="fab" color="success" large dark fab>
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon v-else>mdi-check</v-icon>
          </v-btn>
        </template>
        <v-tooltip left>
          <template v-slot:activator="{on}">
            <v-btn dark fab elevation="24" color="warning" v-on="on" @click="$emit('save')">
              <v-icon>mdi-content-save-outline</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>
        <v-tooltip left>
          <template v-slot:activator="{on}">
            <v-btn dark fab elevation="24" color="secondary" v-on="on" @click="$emit('submit'), $emit('save')">
              <v-icon>mdi-file-send</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>
      <v-btn
        v-else
        large
        dark
        fab
        fixed
        bottom
        right
        elevation="24"
        color="success"
        @click="$emit('submit')"
      >
        <v-icon>mdi-content-save-outline</v-icon>
      </v-btn>
    </v-content>

    <v-btn
      v-else
      large
      dark
      fab
      fixed
      bottom
      right
      elevation="24"
      color="success"
      @click="$emit('nextStep')"
    >
      <v-icon>mdi-arrow-right-drop-circle</v-icon>
    </v-btn>
  </v-row>
</template>

<script>
export default {
  props: ["step", "size","create"],
  data() {
    return {
      fab: false
    };
  }
};
</script>

<style>
</style>