<template>
  <v-container>
    <v-row v-if="!postTest" class="fill-height" align="center" justify="center">
      <v-col cols="12">
        <v-row justify="center">
          <h1>{{ item.name }}</h1>
        </v-row>
        <v-spacer />
        <v-row v-if="item.tip !== null" justify="end">
          <TipButton :task="item" />
        </v-row>
        <v-spacer />
        <v-row justify="center">
          <p class="paragraph">
            {{ item.description }}
          </p>
        </v-row>
        <v-spacer />
        <v-row justify="center">
          <v-btn v-if="item.timer === true" color="success">
            <v-icon left>
              mdi-timer
            </v-icon>Start
          </v-btn>
        </v-row>
        <v-spacer />
        <v-row class="paragraph" justify="space-around">
          <v-col v-if="item.answer === 'textArea'">
            <v-textarea
              :id="'id-'+item.name"
              v-model="item.res"
              outlined
              label="answer"
              @change="updated"
            />
          </v-col>
          <v-col>
            <v-textarea
              :id="'id-'+item.name"
              v-model="item.obs"
              outlined
              label="observation (optional)"
              @change="updated"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row v-else class="fill-height" align="center" justify="center">
      <iframe
        :src="item.postTest"
        width="100%"
        height="900"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
      >Carregando…</iframe>
    </v-row>
  </v-container>
</template>

<script>
import TipButton from '../atoms/TipButton'
export default {
  components: {
    TipButton,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    postTest: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    updated() {
      this.$emit('updatedAnswer', this.item)
    },
  },
}
</script>
