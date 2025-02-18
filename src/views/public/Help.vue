<template>
  <div>
    <v-card
      align="center"
      img="https://theme.zdassets.com/theme_assets/717481/e805a01ba4ee2b0b1d0aa58dca3eb97f54c31e95.png"
      height="250"
      elevation="0"
      rounded="0"
    >
      <v-col
        cols="12"
        xs="4"
        sm="8"
        md="6"
        lg="6"
        xl="6"
        style="user-select: none;"
      >
        <div
          class="mt-12 display-3 bold font-weight-bold"
          style="color: white;"
        >
          Help Center
        </div>
        <div class="mt-3 display-2 bold font-weight-bold" style="color: white;">
          How can we help?
        </div>
      </v-col>
    </v-card>

    <v-container>
      <v-row>
        <v-col cols="12" xs="4" sm="8" md="6" lg="6" xl="6">
          <v-list outlined rounded>
            <v-list-item v-for="(item, index) in itemsLeft" :key="index">
              <v-list-item-content>
                <v-list-item-title class="title" @click="toggleCollapse(index)">
                  <v-icon v-if="!item.isCollapsed" small>
                    mdi-chevron-down
                  </v-icon>
                  <v-icon v-else small>
                    mdi-chevron-right
                  </v-icon>
                  {{ item.title }}
                </v-list-item-title>
                <v-expand-transition>
                  <v-row v-if="!item.isCollapsed">
                    <v-col
                      cols="6"
                      xs="4"
                      sm="6"
                      md="6"
                      lg="7"
                      xl="6"
                      align="justify"
                    >
                      <div class="subtitle-1 ml-5">
                        {{ item.content }}
                      </div>
                      <div class="ml-5">
                        <v-img
                          max-width="800"
                          :src="require(`@/assets/faqs/${item.gif}`)"
                          style="object-fit: contain"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-expand-transition>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12" xs="4" sm="8" md="6" lg="6" xl="6">
          <v-list outlined rounded>
            <v-list-item v-for="(item, index) in itemsRight" :key="index">
              <v-list-item-content>
                <v-list-item-title
                  class="title"
                  @click="toggleCollapse(index + 5)"
                >
                  <v-icon v-if="!item.isCollapsed" small>
                    mdi-chevron-down
                  </v-icon>
                  <v-icon v-else small>
                    mdi-chevron-right
                  </v-icon>
                  {{ item.title }}
                </v-list-item-title>
                <v-expand-transition>
                  <v-row v-if="!item.isCollapsed">
                    <v-col
                      cols="6"
                      xs="4"
                      sm="6"
                      md="7"
                      lg="7"
                      xl="6"
                      align="justify"
                    >
                      <div class="subtitle-1 ml-5">
                        {{ item.content }}
                      </div>
                      <div class="ml-5">
                        <v-img
                          max-width="800"
                          :src="require(`@/assets/faqs/${item.gif}`)"
                          style="object-fit: contain"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-expand-transition>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import i18n from '@/i18n'

export default {
  data() {
    return {
      items: [
        {
          title: i18n.t('help.createtest'),
          content: i18n.t('help.createtestanswer'),
          gif: 'create_test.gif',
          isCollapsed: true, // Initially collapsed
        },
        {
          title: i18n.t('help.heuristictest'),
          content: i18n.t('help.heuristictestanswer'),
          gif: 'hsetup.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.deletetest'),
          content: i18n.t('help.deletetestanswer'),
          gif: 'del_test.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.createtemplate'),
          content: i18n.t('help.createtemplateanswer'),
          gif: 'create-temp.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.usetemplate'),
          content: i18n.t('help.usetemplateanswer'),
          gif: 'use-temp.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.previewtest'),
          content: i18n.t('help.previewtestanswer'),
          gif: 'preview_test.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.importcsv'),
          content: i18n.t('help.importcsvanswer'),
          gif: 'csv.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.invitecooperators'),
          content: i18n.t('help.invitecooperatorsanswer'),
          gif: 'sendinvite.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.analyseresults'),
          content: i18n.t('help.analyseresultsanswer'),
          gif: 'analytics.gif',
          isCollapsed: true,
        },
        {
          title: i18n.t('help.sendmessage'),
          content: i18n.t('help.sendmessageanswer'),
          gif: 'send_message.gif',
          isCollapsed: true,
        },
      ],
    }
  },

  computed: {
    itemsLeft() {
      const totalItems = this.items.length
      const halfItems = Math.ceil(totalItems / 2)
      return this.items.slice(0, halfItems)
    },
    itemsRight() {
      const totalItems = this.items.length
      const halfItems = Math.ceil(totalItems / 2)
      return this.items.slice(halfItems)
    },
  },

  methods: {
    toggleCollapse(index) {
      this.items.forEach((item, i) => {
        if (i !== index) {
          item.isCollapsed = true
        }
      })

      this.items[index].isCollapsed = !this.items[index].isCollapsed
    },
  },
}
</script>

<style></style>
