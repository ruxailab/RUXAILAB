<template>
  <div class="tool-selector">
    <div class="selector-header">
      <div class="header-icon">
        <v-icon icon="mdi-view-grid-outline" size="20" />
      </div>
      <div class="header-content">
        <h3 class="header-title">Select Analysis to View</h3>
        <p class="header-subtitle">Choose which tool results you want to explore</p>
      </div>
    </div>

    <div class="tools-grid">
      <!-- ChromaCheck Card -->
      <div 
        :class="['tool-card', { 'tool-available': toolStatus.chroma_check, 'tool-unavailable': !toolStatus.chroma_check }]"
        @click="selectTool('chroma_check')"
      >
        <div class="tool-icon tool-icon-purple">
          <v-icon icon="mdi-palette" size="28" />
        </div>
        <h4 class="tool-name">ChromaCheck</h4>
        <p class="tool-description">Color Contrast Analysis</p>
        
        <div v-if="toolStatus.chroma_check" class="tool-status tool-status-available">
          <v-icon icon="mdi-check-circle" size="14" />
          <span>Available</span>
        </div>
        <div v-else class="tool-status tool-status-pending">
          <v-icon icon="mdi-clock-outline" size="14" />
          <span>Not Run</span>
        </div>

        <div v-if="toolStatus.chroma_check && results.chroma_check" class="tool-stats">
          <span class="stat-value">{{ results.chroma_check.total_issues || 0 }}</span>
          <span class="stat-label">issues found</span>
        </div>

        <div v-if="toolStatus.chroma_check" class="tool-arrow">
          <v-icon icon="mdi-arrow-right" size="18" />
        </div>
      </div>

      <!-- AnchorSense Card -->
      <div 
        :class="['tool-card', { 'tool-available': toolStatus.anchor_sense, 'tool-unavailable': !toolStatus.anchor_sense }]"
        @click="selectTool('anchor_sense')"
      >
        <div class="tool-icon tool-icon-blue">
          <v-icon icon="mdi-link-variant" size="28" />
        </div>
        <h4 class="tool-name">AnchorSense</h4>
        <p class="tool-description">Anchor Tag Analysis</p>
        
        <div v-if="toolStatus.anchor_sense" class="tool-status tool-status-available">
          <v-icon icon="mdi-check-circle" size="14" />
          <span>Available</span>
        </div>
        <div v-else class="tool-status tool-status-pending">
          <v-icon icon="mdi-clock-outline" size="14" />
          <span>Not Run</span>
        </div>

        <div v-if="toolStatus.anchor_sense && results.anchor_sense" class="tool-stats">
          <span class="stat-value">{{ results.anchor_sense.total_issues || 0 }}</span>
          <span class="stat-label">issues found</span>
        </div>

        <div v-if="toolStatus.anchor_sense" class="tool-arrow">
          <v-icon icon="mdi-arrow-right" size="18" />
        </div>
      </div>

      <!-- ImgTagTip Card -->
      <div 
        :class="['tool-card', { 'tool-available': toolStatus.img_tip, 'tool-unavailable': !toolStatus.img_tip }]"
        @click="selectTool('img_tip')"
      >
        <div class="tool-icon tool-icon-green">
          <v-icon icon="mdi-image-text" size="28" />
        </div>
        <h4 class="tool-name">ImgTagTip</h4>
        <p class="tool-description">Image Alt Text Analysis</p>
        
        <div v-if="toolStatus.img_tip" class="tool-status tool-status-available">
          <v-icon icon="mdi-check-circle" size="14" />
          <span>Available</span>
        </div>
        <div v-else class="tool-status tool-status-pending">
          <v-icon icon="mdi-clock-outline" size="14" />
          <span>Not Run</span>
        </div>

        <div v-if="toolStatus.img_tip && results.img_tip" class="tool-stats">
          <span class="stat-value">{{ results.img_tip.issues_found || 0 }}</span>
          <span class="stat-label">issues found</span>
        </div>

        <div v-if="toolStatus.img_tip" class="tool-arrow">
          <v-icon icon="mdi-arrow-right" size="18" />
        </div>
      </div>
    </div>

    <!-- No Tools Available Message -->
    <div v-if="!hasAnyResults" class="empty-banner">
      <div class="empty-banner-content">
        <v-icon icon="mdi-information-outline" size="20" />
        <span>No analysis results available yet. Run the tools first.</span>
      </div>
      <button class="run-btn" @click="$emit('run-analysis')">
        <v-icon icon="mdi-play" size="16" />
        <span>Run Analysis</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  toolStatus: {
    type: Object,
    required: true
  },
  results: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['select-tool', 'run-analysis']);

const hasAnyResults = computed(() => {
  return props.toolStatus.chroma_check || props.toolStatus.anchor_sense || props.toolStatus.img_tip;
});

const selectTool = (toolName) => {
  if (props.toolStatus[toolName]) {
    emit('select-tool', toolName);
  }
};
</script>

<style scoped>
.tool-selector {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

/* Header */
.selector-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.header-subtitle {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0;
}

/* Tools Grid */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 24px;
}

/* Tool Card */
.tool-card {
  position: relative;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  transition: all 0.25s ease;
}

.tool-card.tool-available {
  cursor: pointer;
  background: white;
  border-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.1);
}

.tool-card.tool-available:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #16a34a;
}

.tool-card.tool-unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.tool-card.tool-unavailable .tool-icon {
  background: linear-gradient(135deg, #d0d0d0 0%, #b0b0b0 100%);
}

/* Tool Icon */
.tool-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.tool-icon-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.tool-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.tool-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

/* Tool Name */
.tool-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
}

/* Tool Description */
.tool-description {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0 0 16px;
}

/* Tool Status */
.tool-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tool-status-available {
  background: #dcfce7;
  color: #16a34a;
}

.tool-status-pending {
  background: #f3f4f6;
  color: #6b6b6b;
}

/* Tool Stats */
.tool-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b6b6b;
}

/* Tool Arrow */
.tool-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b6b6b;
  transition: all 0.2s ease;
}

.tool-card.tool-available:hover .tool-arrow {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
}

/* Empty Banner */
.empty-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: #fef3c7;
  border-top: 1px solid #fcd34d;
}

.empty-banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #92400e;
}

.run-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.run-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

/* Responsive */
@media (max-width: 900px) {
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tool-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    padding: 18px;
    gap: 16px;
  }

  .tool-icon {
    margin: 0;
    flex-shrink: 0;
  }

  .tool-card > div:not(.tool-icon):not(.tool-arrow) {
    flex: 1;
  }

  .tool-name {
    margin-bottom: 2px;
  }

  .tool-description {
    margin-bottom: 8px;
  }

  .tool-stats {
    margin-top: 8px;
    padding-top: 8px;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .stat-value {
    font-size: 18px;
    display: inline;
    margin-bottom: 0;
  }

  .tool-arrow {
    position: static;
  }

  .empty-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .run-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
