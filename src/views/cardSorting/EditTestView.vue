<template>
  <v-container>
    <ButtonSave :visible="change" @click="() => {}" />
    
    <v-row>
      <v-col cols="12" class="pb-0">
        <v-tabs
          v-model="tabIndex"
          background-color="transparent"
          color="#FCA326"
          class="pb-0 mb-0"
        >
          <v-tab>PRE-TEST</v-tab>
          <v-tab>CATEGORIES</v-tab>
          <!-- <v-tab>CARDS</v-tab> -->
          <!-- <v-tab>POST-TEST</v-tab> -->
          <!-- <v-tab>SETTINGS</v-tab> -->
        </v-tabs>

        <v-col cols="12">
          <!-- PRE-TEST -->
          <PreTestCardSorting v-if="tabIndex === 0" />

          <!-- TASKS -->
          <CategoriesCardSorting v-else-if="tabIndex === 1" />
        </v-col>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ButtonSave from '@/components/atoms/ButtonSave'
import PreTestCardSorting from '@/components/organisms/PreTestCardSorting'
import CategoriesCardSorting from '@/components/organisms/CategoriesCardSorting'

export default {
  components: {
    ButtonSave,
    PreTestCardSorting,
    CategoriesCardSorting,
  },

  data: () => ({
    tabIndex: 0,
  }),

  computed: {
    change() {
      return this.$store.state.localChanges
    },
  }
}
</script>