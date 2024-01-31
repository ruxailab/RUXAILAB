<template>
  <dsadsaas>
    <v-card
      v-if="tasks.length == 0"
      style="background: #f5f7ff; min-height: 150px"
      flat
      class="cards mt-2"
    >
      <v-row justify="center">
        <v-col cols="12" class="pa-5">
          <span class="cardsTitle ml-5">Tasks</span>
          <br />
          <span class="cardsSubtitle ml-5 mb-1"
            >Create tasks for your evaluators</span
          >
          <v-row justify="center">
            <v-col cols="8">
              <v-card
                class="mt-4"
                rounded="xl"
                @click="tasks = [1]"
                outlined
                elevation="0"
                color="grey lighten-2"
              >
                <p class="text-subtitle-1 text-center ma-2">
                  <v-icon>mdi-plus-circle</v-icon>
                  Add your first task
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
    <draggable
      v-model="tasks"
      group="people"
      @start="drag = true"
      @end="drag = false"
    >
      <v-card
        v-for="(item, n) in tasks"
        :key="n"
        style="background: #f5f7ff"
        flat
        class="cards mb-5"
      >
        <v-col cols="12" class="pb-0 px-5 pt-4">
          <v-icon>mdi-drag</v-icon>
          <span class="cardsTitle ml-3">Task {{ tasks[n] }}</span>
          <br />
          <span class="cardsSubtitle ml-9">Task Description</span>
        </v-col>
        <v-textarea
          rows="3"
          outlined
          color="orange"
          class="mx-6 mt-3"
          placeholder="Write what you want to task..."
        ></v-textarea>
        <v-row justify="center">
          <v-btn
            fab
            depressed
            dark
            color="rgb(249, 168, 38)"
            style="margin-bottom: -30px; z-index: 3;"
            @click="tasks.push(tasks.length + 1)"
            ><v-icon size="35">mdi-plus</v-icon>
          </v-btn>
        </v-row>
      </v-card>
    </draggable>
  </dsadsaas>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  data: () => ({
    tasks: [],
  }),
  components: { draggable },
}
</script>

<style scoped>
.cards {
  border-radius: 20px;
}
.cardsTitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.cardsSubtitle {
  color: #455a64;
  font-family: 'Poppins', Helvetica;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.v-text-field--outlined >>> fieldset {
  border-radius: 25px;
  border: 1px solid #ffceb2;
}
</style>
