<template>
    <v-card
    elevation="2"
    rounded="lg"
    class="mb-6"
  >
    <v-card-title class="d-flex align-center justify-space-between py-4 px-3 px-sm-4">
      <div class="d-flex align-center truncate-title">
        <v-icon
          v-if="!isVerySmallScreen"
          icon="mdi-post"
          class="me-2 flex-shrink-0"
          color="primary"
          :size="iconSize"
        />
        <span class="title-text">Latest Blog Posts</span>
      </div>
      <div class="d-flex align-center ga-1 ga-sm-2 flex-shrink-0">
        <v-btn
          variant="text"
          :size="buttonSize"
          color="primary"
          @click="openBlog"
          target="_blank"
          class="view-blog-btn"
        >
          View Blog
        </v-btn>
        <v-progress-circular
          v-if="loading"
          indeterminate
          :size="progressSize"
          color="primary"
          class="flex-shrink-0"
        />
      </div>
    </v-card-title>

    <v-card-text class="py-4 px-3 px-sm-4">
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
          :density="isMobile ? 'compact' : 'default'"
        >
          <template #prepend>
            <v-icon
              v-if="!isMobile"
              icon="mdi-chevron-right"
              color="primary"
              class="me-2 me-sm-3 flex-shrink-0"
            />
          </template>
          
          <v-list-item-title class="post-title">
            {{ post.title }}
          </v-list-item-title>
          <div
            v-if="post.excerpt"
            class="excerpt line-clamp-2"
          >
            {{ post.excerpt }}
          </div>
          <div class="post-footer">
            <v-chip
              v-if="post.category && !isMobile"
              :text="post.category"
              size="x-small"
              variant="outlined"
              color="primary"
              class="mr-2"
            />
            <span class="post-date">{{ post.displayDate || post.date }}</span>
            <v-icon
              icon="mdi-open-in-new"
              :size="externalIconSize"
              color="primary"
              class="flex-shrink-0"
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
          :type="isMobile ? 'list-item' : 'list-item-two-line'"
          class="mb-2"
        />
      </div>
      
      <!-- Mobile only: View All button -->
      <v-btn
        v-if="isMobile"
        block
        variant="outlined"
        color="primary"
        size="small"
        class="mt-4"
        :href="blogUrl"
        target="_blank"
      >
        View All Posts
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

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
/* Card header responsive styles */
.truncate-title {
  min-width: 0;
  flex: 1;
}

.title-text {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-blog-btn {
  white-space: nowrap;
  transition: all 0.2s ease;
}

/* Blog post items */
.blog-post-item {
  padding: 1rem 0.5rem;
  transition: background-color 0.2s ease;
}

@media (min-width: 600px) {
  .blog-post-item {
    padding: 1.5rem 1rem;
  }
}

@media (min-width: 960px) {
  .blog-post-item {
    padding: 2rem 1.5rem;
  }
}

.blog-post-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.border-bottom {
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

/* Typography */
.post-title {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

@media (min-width: 600px) {
  .post-title {
    font-size: 1rem;
  }
}

.excerpt {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-background), 0.6);
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

@media (min-width: 600px) {
  .excerpt {
    font-size: 0.875rem;
  }
}

.post-date {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-background), 0.6);
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.25rem;
}

/* Line clamp for excerpt */
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ultra-responsive adjustments */
@media (max-width: 379px) {
  .v-card-title .v-icon[icon="mdi-post"] {
    display: none !important;
  }
}

@media (max-width: 340px) {
  .title-text {
    font-size: 1.125rem;
    white-space: normal;
    line-height: 1.3;
  }
  
  .view-blog-btn {
    font-size: 0.6875rem !important;
    padding: 0 6px !important;
    min-width: 60px !important;
    height: 28px !important;
  }
}

@media (max-width: 329px) {
  .title-text {
    font-size: 1rem;
    line-height: 1.2;
  }
  
  .view-blog-btn {
    font-size: 0.625rem !important;
    padding: 0 4px !important;
    min-width: 56px !important;
    height: 26px !important;
    letter-spacing: -0.2px;
  }
  
  .v-progress-circular {
    width: 14px !important;
    height: 14px !important;
  }
}

@media (max-width: 280px) {
  .title-text {
    font-size: 0.875rem;
  }
  
  .view-blog-btn {
    font-size: 0.5625rem !important;
    padding: 0 3px !important;
    min-width: 52px !important;
    height: 24px !important;
  }
}

/* Improve touch targets on mobile */
@media (max-width: 599px) {
  :deep(.v-list-item) {
    min-height: 48px;
  }
  
  :deep(.v-btn) {
    min-height: 36px;
  }
}

/* Adjust list item spacing */
:deep(.v-list-item__content) {
  padding: 0;
  width: 100%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>