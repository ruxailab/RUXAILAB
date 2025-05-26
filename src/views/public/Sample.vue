<template>
  <div class="sample-page">
    <h1>Web Accessibility Checklist</h1>
    <p>Answer the following questions about your web content to assess its accessibility compliance with WCAG standards.</p>
    <AccessibilityQuiz />
  </div>
</template>

<script setup>
import AccessibilityQuiz from '@/components/AccessibilityQuiz.vue'
</script>

<style scoped>
.sample-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
}

p {
    color: #666;
    text-align: center;
    margin-bottom: 30px;
}
</style>