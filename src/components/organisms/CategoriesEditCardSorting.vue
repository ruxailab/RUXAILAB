<template>
  <div>
    <!-- Create Dialog -->
    <CreateVariable :dialog="dialog" title="Category" @close="dialog = false" @save="save" />

    <VRow>
      <VCol cols="8">
        <CardForm v-if="categories.length === 0" title="Categories"
          subtitle="Categories are groups or themes used to organize items during card sorting. They must be clear, separated and aligned with the objective of the exercise, helping those evaluated to classify the items in a logical and intuitive way.">
          <v-row justify="center">
            <v-col cols="8">
              <CardButton icon="mdi-plus-circle" text="Add your first Category" @click="dialog = true" />
            </v-col>
          </v-row>
        </CardForm>

        <Draggable v-model="categories" item-key="title" class="list-group">
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
                    v-if="options.category_description || options.category_tooltip || options.category_image">
                    {{ expandedIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                  </v-icon>
                  <v-icon @click.stop="deleteCategory(index)">
                    mdi-delete
                  </v-icon>
                </div>
              </v-card-title>

              <v-expand-transition>
                <div v-show="expandedIndex === index">
                  <v-card-text>
                    <VRow>
                      <VCol :cols="options.category_tooltip ? 6 : 12" v-if="options.category_description">
                        <InputTextEditTest :value="element.description" label="Description"
                          @input="element.description = $event; onChange()" />
                      </VCol>
                      <VCol :cols="options.category_description ? 6 : 12" v-if="options.category_tooltip">
                        <InputTextEditTest :value="element.tooltip" label="Tooltip"
                          @input="element.tooltip = $event; onChange()" />
                      </VCol>
                      <VCol cols="12">
                        <!-- <v-file-input v-if="options.category_image" accept="image/*" label="Image" variant="outlined"
                          color="orange" class="mx-3" @update:model-value="element.image = $event" /> -->
                      </VCol>
                    </VRow>
                  </v-card-text>
                </div>
              </v-expand-transition>
            </v-card>
          </template>
        </Draggable>

        <v-row v-if="categories.length > 0" justify="center">
          <v-btn icon variant="flat" color="rgb(249, 168, 38)" @click="dialog = true">
            <v-icon size="35">
              mdi-plus
            </v-icon>
          </v-btn>
        </v-row>
      </VCol>

      <VCol cols="4">
        <CardForm title="Settings" subtitle="Configure how categories will be displayed">
          <v-checkbox v-model="options.category_description" label="Show Category Description"
            @update:model-value="onChange()" />
          <v-checkbox v-model="options.category_tooltip" label="Show Tooltip Description"
            @update:model-value="onChange()" />
          <v-checkbox v-model="options.category_image" label="Show Image" @update:model-value="onChange()" />
          <v-checkbox v-model="options.category_random" label="Randomize the order of cards"
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
    InputTextEditTest,
  },

  data: () => ({
    categories: [],
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
    categories(newValue) {
      this.$store.commit('SET_CARDSORTING_CATEGORIES_TEST_STRUCTURE', this.categories)
      this.$store.commit('SET_LOCAL_CHANGES', true)
    }
  },

  created() {
    if (!this.testStructure) {
      this.$store.commit('SET_TEST_STRUCTURE', this.test.testStructure)
    }

    const { categories = [] } = this.testStructure?.cardSorting || {}
    this.categories = categories
    this.options = this.testStructure?.cardSorting?.options || {
      category_description: false,
      category_tooltip: false,
      category_image: false,
      category_random: false,
    }
  },

  methods: {
    save(item) {
      this.dialog = false
      this.categories.push(item)
    },

    deleteCategory(i) {
      this.categories.splice(i, 1)
    },

    onChange() {
      this.$store.commit('SET_CARDSORTING_OPTIONS_TEST_STRUCTURE', this.options)
      this.$store.commit('SET_CARDSORTING_CATEGORIES_TEST_STRUCTURE', this.categories)
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
