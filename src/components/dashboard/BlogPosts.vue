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
        Latest Blog Posts
      </div>
      <v-btn
        variant="text"
        size="small"
        color="primary"
        href="https://blog-ruxailab.web.app/"
        target="_blank"
      >
        View Blog
      </v-btn>
    </v-card-title>

    <v-card-text class="py-4">
      <v-list class="py-0">
        <v-list-item
          v-for="(post, index) in blogPosts"
          :key="post.id"
          :href="post.url"
          target="_blank"
          class="blog-post-item"
          :class="{ 'border-bottom': index < blogPosts.length - 1 }"
        >
          <v-list-item-title class="text-body-1 font-weight-medium mb-1">
            {{ post.title }}
          </v-list-item-title>

          <v-list-item-subtitle class="text-body-2 text-medium-emphasis mb-2">
            {{ post.excerpt }}
          </v-list-item-subtitle>

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-chip
                size="x-small"
                color="primary"
                variant="tonal"
                class="me-2"
              >
                {{ post.category }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">{{ post.date }}</span>
            </div>
            <v-icon
              icon="mdi-open-in-new"
              size="16"
              color="primary"
            />
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

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
        title: 'The Future of UX Research: AI-Powered Insights',
        excerpt: 'Exploring how artificial intelligence is revolutionizing user experience research methodologies...',
        url: 'https://blog-ruxailab.web.app/ai-ux-research',
        category: 'Research',
        date: '2 days ago'
    },
    {
        id: 2,
        title: 'Accessibility Testing: Best Practices for 2024',
        excerpt: 'A comprehensive guide to ensuring your applications are accessible to all users...',
        url: 'https://blog-ruxailab.web.app/accessibility-testing-2024',
        category: 'Accessibility',
        date: '1 week ago'
    },
    {
        id: 3,
        title: 'Remote Usability Testing: Tools and Techniques',
        excerpt: 'Learn how to conduct effective usability tests in a remote-first world...',
        url: 'https://blog-ruxailab.web.app/remote-usability-testing',
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
.blog-post-item {
    padding: 2rem 1.5rem;
}

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
