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

<style>
.v-list-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 12px 0;
  border-radius: 16px !important;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(250, 250, 250, 0.95);
}

.v-list-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%);
  border-color: rgba(24, 103, 192, 0.3);
}

.v-list-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.v-list-item:hover::before {
  opacity: 1;
}

.v-list {
  background: rgba(245, 245, 245, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(200, 200, 200, 0.5) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 16px;
}

.subtitle-1 {
  line-height: 1.8;
  opacity: 0;
  animation: fadeIn 0.6s ease forwards;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
  letter-spacing: 0.015em;
  padding: 8px 0;
}

.v-list-item-title {
  cursor: pointer;
  padding: 16px 0;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.01em;
  font-size: 1.1rem;
  color: #1565c0;
}

.v-list-item-title:hover {
  color: #1976d2;
  transform: translateX(8px);
}

.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-expand-transition-enter,
.v-expand-transition-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.display-3,
.display-2 {
  text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.6);
  animation: slideDown 1s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.02em;
  color: #ffffff;
  font-weight: 700;
}

.v-icon {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.5rem;
  color: #1565c0;
  margin-right: 8px;
}

.v-list-item:hover .v-icon {
  transform: scale(1.3) rotate(180deg);
  color: #1976d2;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes subtle-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

html {
  scroll-behavior: smooth;
}

.v-list-item:not(.v-list-item--active):active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #e1e9f1 0%, #ffffff 100%);
}

.v-list-item-title::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: #1565c0;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(21, 101, 192, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0);
  }
}

.v-list-item:focus-visible {
  outline: 3px solid #1565c0;
  outline-offset: 2px;
}
</style>
