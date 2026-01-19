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
      <div class="d-flex align-center ga-2">
        <v-btn
          variant="text"
          size="small"
          color="primary"
          @click="openBlog"
          target="_blank"
        >
          View Blog
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
      <div
        v-if="!loading"
        class="blog-posts-scroll-container"
      >
        <v-list class="py-0">
          <v-list-item
            v-for="(post, index) in blogPosts"
            :key="post.id || index"
            :href="post.url"
            target="_blank"
            :class="{ 'border-bottom': index < blogPosts.length - 1 }"
          >
            <div class="d-flex align-start py-3 px-1">
              <div class="flex-grow-1 mr-4">
                <v-list-item-title class="text-body-1 font-weight-medium mb-1">
                  {{ post.title }}
                </v-list-item-title>
                <v-list-item-subtitle
                  v-if="post.excerpt"
                  class="excerpt text-body-2 text-medium-emphasis"
                  :title="post.excerpt"
                >
                  {{ post.excerpt }}
                </v-list-item-subtitle>
              </div>
              <div class="d-flex align-center flex-shrink-0 ga-2">
                <span class="text-caption text-medium-emphasis text-no-wrap">{{ post.date }}</span>
                <v-icon
                  icon="mdi-open-in-new"
                  size="16"
                  color="primary"
                />
              </div>
            </div>
          </v-list-item>
        </v-list>
      </div>
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
        excerpt: "Over the summer, Tianqin designed and implemented the first version of Disgitbot, turning Discord into a live dashboard for GitHub activity...",
        url: 'https://blog-ruxailab.web.app/posts/disgitbot-gsoc-2025.html',
        category: 'GSoC',
        date: 'June 9, 2025'
    },
    {
        id: 2,
        title: 'Introducing the RUXAILAB Blog',
        excerpt: "We're excited to launch the RUXAILAB Blog, a space to share insights, tutorials, and updates from our work...",
        url: 'https://blog-ruxailab.web.app/posts/ruxailab-blog.html',
        category: 'Announcements',
        date: 'April 1, 2025'
    },
    {
        id: 3,
        title: 'RUXAILAB Selected for Google Summer of Code 2025',
        excerpt: 'We are proud to announce that RUXAILAB has been officially selected as a mentoring organization for Google Summer of Code 2025!',
        url: 'https://blog-ruxailab.web.app/posts/ruxailab-gsoc.html',
        category: 'Announcements',
        date: 'December 20, 2024'
    },
    {
        id: 4,
        title: 'RUXAILAB Awarded for Accessibility Innovation from AccesCat',
        excerpt: 'We are thrilled to announce that RUXAILAB has received the top award in the II Convocatoria de Solucions Disruptives 2025...',
        url: 'https://blog-ruxailab.web.app/posts/ruxailab-accesscat.html',
        category: 'Awards',
        date: 'July 1, 2024'
    },
    {
        id: 5,
        title: "GSoC 2024 Journey (Basma's project) - Sentiment Analysis for Usability Testing",
        excerpt: "Developing a sentiment analysis solution for usability testing data extraction with RUXAILAB using AI...",
        url: 'https://blog-ruxailab.web.app/posts/gsoc-2024-sentiment-analysis-basma.html',
        category: 'GSoC',
        date: 'June 15, 2024'
    },
    {
        id: 6,
        title: "GSoC 2024 Journey (Julio's project) - Implementing Card Sorting Method",
        excerpt: "Implementing the Card Sorting method in RUXAILAB, expanding our UX evaluation toolkit with a powerful new methodology...",
        url: 'https://blog-ruxailab.web.app/posts/gsoc-2024-card-sorting-julio.html',
        category: 'GSoC',
        date: 'June 1, 2024'
    },
    {
        id: 7,
        title: "GSoC 2024 Journey (Sitam's project) - Eye Tracking Algorithm Optimization",
        excerpt: "Working on Eye Tracking Algorithm Optimization Based on Low-Resolution Cameras as part of GSoC 2024...",
        url: 'https://blog-ruxailab.web.app/posts/gsoc-2024-eye-tracking-sitam.html',
        category: 'GSoC',
        date: 'April 15, 2024'
    },
    {
        id: 8,
        title: "RUXAILAB's First Google Summer of Code 2024 - A Milestone Achievement",
        excerpt: "2024 marked a historic milestone for RUXAILAB - our first-ever participation as a mentoring organization in GSoC!",
        url: 'https://blog-ruxailab.web.app/posts/ruxailab-gsoc-2024.html',
        category: 'Announcements',
        date: 'August 18, 2024'
    }
]

// Initialize blog posts
onMounted(() => {
    blogPosts.value = props.posts.length > 0 ? props.posts : defaultPosts
})
</script>

<style scoped>
.blog-posts-scroll-container {
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--v-theme-primary)) transparent;
}

.blog-posts-scroll-container::-webkit-scrollbar {
    width: 6px;
}

.blog-posts-scroll-container::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
}

.blog-posts-scroll-container::-webkit-scrollbar-thumb {
    background-color: rgb(var(--v-theme-primary));
    border-radius: 3px;
}

.blog-posts-scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(var(--v-theme-primary), 0.8);
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