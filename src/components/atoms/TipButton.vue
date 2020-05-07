<template>
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
        color="green"
        class="white--text"
        rounded
        v-on="on"
        >
          Tip
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2 text-center"
          primary-title
        >
          {{ task.name }} - Tip
        </v-card-title>
        
        <v-card-text class="pa-3" style="text-align: center">
        {{task.tip}}
        </v-card-text>
        
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ["task"],
    data: () => ({
        dialog: false
    })
}
</script>