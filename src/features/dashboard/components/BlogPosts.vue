<template>
  <v-card
    elevation="2"
    rounded="lg"
    class="mb-6"
  >
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-post"
          class="me-2"
          color="primary"
          style="padding:1.5rem"
        />
        {{ $t('Dashboard.latestBlogPosts') }}
      </div>
      <div class="d-flex align-center ga-2">
        <v-btn
          variant="text"
          size="small"
          color="primary"
          target="_blank"
          @click="openBlog"
        >
          {{ $t('Dashboard.viewBlog') }}
        </v-btn>
        <v-progress-circular
          v-if="loading"
          indeterminate
          size="20"
          color="primary"
        />
      </div>
    </v-card-title>

    <v-card-text class="py-4">
      <v-alert
        v-if="error"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ error }}
      </v-alert>
      <v-list
        v-if="!loading"
        class="py-0"
      >
        <v-list-item
          v-for="(post, index) in blogPosts"
          :key="post.id || index"
          :href="post.url"
          target="_blank"
          :class="{ 'border-bottom': index < blogPosts.length - 1 }"
        >
          <div class="d-flex align-center justify-space-between py-3 px-1">
            <div>
              <v-list-item-title class="text-body-1 font-weight-medium mb-1">
                {{ post.title }}
              </v-list-item-title>
              <v-list-item-subtitle
                v-if="post.excerpt"
                class="excerpt text-body-2 text-medium-emphasis mb-2"
                :title="post.excerpt"
              >
                {{ post.excerpt }}
              </v-list-item-subtitle>
            </div>
            <span class="text-caption text-medium-emphasis">{{ post.displayDate }}</span>
            <v-icon
              icon="mdi-open-in-new"
              size="16"
              color="primary"
            />
          </div>
        </v-list-item>
      </v-list>
      <div
        v-else
        class="px-2 py-4"
      >
        <v-skeleton-loader
          v-for="n in 3"
          :key="n"
          type="list-item-two-line"
          class="mb-2"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const error = ref(null)

const blogUrl = "https://blog-ruxailab.web.app";

const openBlog = () => {
  window.open(blogUrl, '_blank', 'noopener')
}

const props = defineProps({
    posts: {
        type: Array,
        default: () => []
    }
})

const blogPosts = ref([])

// Default blog posts if none provided
const defaultPosts = [
    {
        id: 1,
        title: "GSoC 2025 Journey (Tianqin's project) - Bridging GitHub and Discord",
        excerpt: "Exploring how Tianqin's project designed and implemented the first version of Disgitbot...",
        url: 'https://blog-ruxailab.web.app/posts/disgitbot-gsoc-2025.html',
        category: 'Research',
        date: '2 days ago'
    },
    {
        id: 2,
        title: 'Introducing the RUXAILAB Blog',
        excerpt: 'We’re excited to launch the RUXAILAB Blog, a space to share insights, tutorials, and...',
        url: 'https://blog-ruxailab.web.app/posts/ruxailab-blog.html',
        category: 'Accessibility',
        date: '1 week ago'
    },
    {
        id: 3,
        title: 'RUXAILAB Selected for Google Summer of Code 2025',
        excerpt: 'We are proud to announce that RUXAILAB has been officially selected as a mentoring...',
        url: 'https://blog-ruxailab.web.app/posts/ruxailab-gsoc.html',
        category: 'Methods',
        date: '2 weeks ago'
    }
]

// Initialize blog posts
onMounted(() => {
    blogPosts.value = props.posts.length > 0 ? props.posts : defaultPosts
})
</script>

<style scoped>
.border-bottom {
    border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

:deep(.v-list-item__content) {
    padding: 0;
}

:deep(.v-list-item-title) {
    white-space: normal;
    line-height: 1.4;
}

:deep(.v-list-item-subtitle) {
    white-space: normal;
    line-height: 1.3;
    opacity: 1;
}
</style>
