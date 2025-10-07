<template>
  <v-navigation-drawer
    :rail="mini"
    permanent
    color="primary"
    class="hidden-sm-and-down pt-3"
  >
    <!-- Navigation header 
    <div v-if="!mini">
      <v-list-item>
        <h3>{{ test.testTitle }}</h3>
      </v-list-item>
    </div>
-->
    <!-- Navigation options -->
    <v-list
      v-if="items"
      density="compact"
    >
      <div v-if="mini">
        <v-tooltip
          v-for="(item, n) in items"
          :key="n"
          location="right"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              @click="go(item)"
            >
              <template #prepend>
                <v-icon :color="$route.path == item.path ? '#fca326' : '#bababa'">
                  {{ item.icon }}
                </v-icon>
              </template>
              <v-list-item-title
                :style="$route.path == item.path ? 'color: #fca326' : 'color:#bababa'"
              >
                {{ $t(`titles.drawer.${item.title}`) }}
              </v-list-item-title>
            </v-list-item>
          </template>
          <span>{{ $t(`titles.drawer.${item.title}`) }}</span>
        </v-tooltip>
      </div>

      <div v-else>
        <v-list-item
          v-for="(item, n) in items"
          :key="n"
          @click="go(item)"
        >
          <template #prepend>
            <v-icon :color="$route.path == item.path ? '#fca326' : '#bababa'">
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title
            :style="$route.path == item.path ? 'color: #fca326' : 'color:#bababa'"
          >
            {{ $t(`titles.drawer.${item.title}`) }}
          </v-list-item-title>
        </v-list-item>
      </div>
    </v-list>

    <!-- Navigation footer -->
    <div class="footer">
      <v-btn
        icon
        size="small"
        class="mr-2 bg-orange"
        @click.stop="mini = !mini"
      >
        <v-icon
          v-if="!mini"
          color="white"
          icon="mdi-chevron-left"
        />
        <v-icon
          v-else
          color="white"
          icon="mdi-chevron-right"
        />
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const store = useStore();
const router = useRouter();
const route = useRoute();

const mini = ref(true);
const test = computed(() => store.state.Tests.Test);

const go = (item) => {
  if (route.path === item.path) return;
  if (item.path === `/testview/${test.value.id}`) return window.open(item.path);
  router.push(item.path);
};

</script>

<style scoped>
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
}
</style>
