<template>
  <div class="home">
    <h2>Test Website Accessibility</h2>

    <div class="form-container">
      <form @submit.prevent="runTest">
        <div class="form-group">
          <label for="url">Website URL</label>
          <input type="url" id="url" v-model="url" placeholder="https://example.com" required class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Testing...' : 'Run Accessibility Test' }}
        </button>
      </form>
    </div>

    <div v-if="isLoading" class="loading">
      <p>Running accessibility tests. This may take a minute...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      url: '',
      isLoading: false,
      error: null
    };
  },
  methods: {
    async runTest() {
      this.isLoading = true;
      this.error = null;

      try {
        // Get the testId from route or store (ensure it's available in your component)
        // For example, if you navigate to this page with /edit/:testId
        const testId = this.$route.params.testId || this.testId;
        const response = await axios.post('http://localhost:3000/api/test', {
          url: this.url,
          testId: testId
        });
        // Redirect to the report page (by testId, not reportId)
        this.$router.push(`/answers/${testId}`);
      } catch (error) {
        console.error('Error running test:', error);
        this.error = error.response?.data?.error || 'Failed to run the accessibility test';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px 0;
}

.form-container {
  max-width: 600px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn {
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading,
.error-message {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.loading {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>