<template>
  <v-container>
    <v-card class="mx-auto">
      <v-list>
        <v-list-item>
          <v-list-item-title>Answers</v-list-item-title>
        </v-list-item>

        <v-list-group v-for="(answer, i) in answers" :key="i" value="true">
          <template v-slot:activator>
            <v-list-item-title>Answer {{i+1}}</v-list-item-title>
          </template>

          <v-list-group no-action sub-group value="true">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Heuristics</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-group v-for="(heuristic, i) in answer.heuristics" :key="i" sub-group no-action>
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>Heuristic {{i+1}}</v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-group
                v-for="(question, i) in heuristic.questions"
                :key="i"
                sub-group
                no-action
              >
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title>Question {{i+1}}</v-list-item-title>
                  </v-list-item-content>
                </template>
                <v-list-item>
                  <v-list-item-title>Answer = {{question.answer}}</v-list-item-title>
                </v-list-item>
              </v-list-group>
            </v-list-group>
          </v-list-group>
        </v-list-group>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    admins: [
      ["Management", "people_outline"],
      ["Settings", "settings"]
    ],
    cruds: [
      ["Create", "add"],
      ["Read", "insert_drive_file"],
      ["Update", "update"],
      ["Delete", "delete"]
    ]
  }),
  computed: {
    answers() {
      if (this.$store.getters.test) return this.$store.getters.answers;
      else return [];
    }
  },
  created() {
    if (!this.$store.test) this.$store.dispatch("getTest", { id: this.id });
  }
};
</script>

<style>
</style>