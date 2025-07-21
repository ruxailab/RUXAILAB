<template>
  <div>
    <!-- Create Dialog -->
    <CreateVariable :dialog="dialog" title="Card" @close="dialog = false" @save="save" />

    <VRow>
      <VCol cols="8">
        <CardForm v-if="cards.length === 0" title="Cards"
          subtitle="Cards are items that represent ideas or information in a categorization exercise. Each card must be clear and concise, allowing the person being evaluated to organize them logically within the categories.">
          <v-row justify="center">
            <v-col cols="8">
              <CardButton icon="mdi-plus-circle" text="Add your first Card" @click="dialog = true" />
            </v-col>
          </v-row>
        </CardForm>

        <Draggable v-model="cards" item-key="id" class="list-group">
          <template #item="{ element, index }">
            <v-card class="cards mb-5">
              <v-card-title @click="toggle(index)" class="d-flex justify-between align-center" style="cursor: pointer">
                <div>
                  <v-icon style="cursor: pointer;">mdi-drag</v-icon>
                </div>

                <div class="ml-3">
                  {{ element.title }}
                </div>

                <div class="d-flex ml-auto align-center">
                  <v-icon class="mr-2" @click.stop="toggle(index)"
                    v-if="options.card_description || options.card_tooltip || options.card_image">
                    {{ expandedIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                  </v-icon>
                  <v-icon @click.stop="deleteCard(index)">
                    mdi-delete
                  </v-icon>
                </div>
              </v-card-title>

              <v-expand-transition>
                <div v-show="expandedIndex === index">
                  <v-card-text>
                    <VRow>
                      <VCol :cols="options.card_tooltip ? 6 : 12" v-if="options.card_description">
                        <InputTextEditTest :value="element.description" label="Description"
                          @input="element.description = $event; onChange()" />
                      </VCol>
                      <VCol :cols="options.card_description ? 6 : 12" v-if="options.card_tooltip">
                        <InputTextEditTest :value="element.tooltip" label="Tooltip"
                          @input="element.tooltip = $event; onChange()" />
                      </VCol>
                      <VCol cols="12">
                        <!-- <v-file-input v-if="options.card_image" accept="image/*" label="Image" variant="outlined"
                          color="orange" class="mx-3" @update:model-value="element.image = $event" /> -->
                      </VCol>
                    </VRow>
                  </v-card-text>
                </div>
              </v-expand-transition>
            </v-card>
          </template>
        </Draggable>

        <v-row v-if="cards.length > 0" justify="center">
          <v-btn icon variant="flat" color="rgb(249, 168, 38)" @click="dialog = true">
            <v-icon size="35">
              mdi-plus
            </v-icon>
          </v-btn>
        </v-row>
      </VCol>

      <VCol cols="4">
        <CardForm title="Settings" subtitle="Configure how categories will be displayed">
          <v-checkbox v-model="options.card_description" label="Show Card Description"
            @update:model-value="onChange()" />
          <v-checkbox v-model="options.card_tooltip" label="Show Tooltip Description"
            @update:model-value="onChange()" />
          <v-checkbox v-model="options.card_image" label="Show Image" @update:model-value="onChange()" />
          <v-checkbox v-model="options.card_required" label="Require respondents to sort all cards"
            @update:model-value="onChange()" />
          <v-checkbox v-model="options.card_random" label="Randomize the order of cards"
            @update:model-value="onChange()" />
        </CardForm>
      </VCol>
    </VRow>
  </div>
</template>

<script>
import CardButton from '@/components/atoms/CardButton'
import CardForm from '@/components/molecules/CardForm'
import CreateVariable from '@/components/dialogs/CreateVariable'
import Draggable from 'vuedraggable'
import InputTextEditTest from '../atoms/InputTextEditTest.vue'

export default {
  components: {
    CardButton,
    CardForm,
    CreateVariable,
    Draggable,
    InputTextEditTest
  },

  data: () => ({
    cards: [],
    options: {},
    expandedIndex: null,
    dialog: false,
  }),

  computed: {
    test() {
      return this.$store.getters.test
    },

    testStructure() {
      return this.$store.getters.testStructure
    },
  },

  watch: {
    cards(newValue) {
      this.$store.commit('SET_CARDSORTING_CARD_TEST_STRUCTURE', this.cards)
      this.$store.commit('SET_LOCAL_CHANGES', true)
    },
  },

  created() {
    if (!this.testStructure) {
      this.$store.commit('SET_TEST_STRUCTURE', this.test.testStructure)
    }

    const { cards = [] } = this.testStructure?.cardSorting || {}
    this.cards = cards
  },

  methods: {
    save(item) {
      this.dialog = false
      this.cards.push(item)
    },

    deleteCategory(i) {
      this.cards.splice(i, 1)
    },

    onChange() {
      this.$store.commit('SET_CARDSORTING_OPTIONS_TEST_STRUCTURE', this.options)
      this.$store.commit('SET_CARDSORTING_CARD_TEST_STRUCTURE', this.cards)
      this.$store.commit('SET_LOCAL_CHANGES', true)
    },

    toggle(index) {
      this.expandedIndex = this.expandedIndex === index ? null : index
    }
  },
}
</script>

<style scoped>
.cards {
  border-radius: 20px;
  padding: 1rem;
}
</style>
