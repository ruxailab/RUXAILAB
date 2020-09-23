<template>
  <div>
    <v-row justify="center" align="center">
      <v-col cols="11" class="py-0">
        <slot name="answer"></slot>
      </v-col>
      <v-col cols="1" class="mb-6 py-0">
        <v-tooltip bottom v-if="!show">
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="show = !show" icon v-bind="attrs" v-on="on">
              <v-icon :color="comment.com ? '#F9A826' : ''">mdi-comment-plus-outline</v-icon>
            </v-btn>
          </template>
          <span v-if="comment.com">Show comment</span>
          <span v-else>Add comment</span>
        </v-tooltip>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{ on, attrs }">
            <v-btn @click="show = !show" icon v-bind="attrs" v-on="on">
              <v-icon>mdi-comment-processing-outline</v-icon>
            </v-btn>
          </template>
          <span>Hide text area</span>
        </v-tooltip>
      </v-col>

      <v-col cols="12" class="py-0">
        <v-textarea
          outlined
          dense
          auto-grow
          v-if="show"
          v-model="comment.com"
          clearable
          clear-icon="mdi-close"
          label="Comment"
        ></v-textarea>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: ["comment", "heurisIndex"],
  data: () => ({
    show: false
  }),
  watch: {
    heurisIndex() {
      this.show = false; //close comment when changing heuristic
    }
  }
};
</script>
