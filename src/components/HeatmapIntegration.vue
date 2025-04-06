<template>
  <!-- Container for the heatmap overlay -->
  <div class="heatmap-container" ref="heatmapContainer" style="position: relative; width: 100%; height: 100%;">
    <!-- Heatmap will render inside this container -->
  </div>
</template>

<script>
import h337 from 'heatmap.js'
// Import the Firestore instance from your Firebase initialization file.
import { db } from '@/firebase'  // Adjust the path as needed

export default {
  name: 'HeatmapIntegration',
  data() {
    return {
      heatmapInstance: null,
      debounceTimer: null,
    }
  },
  mounted() {
    // Initialize the heatmap instance
    try {
      this.heatmapInstance = h337.create({
        container: this.$refs.heatmapContainer,
        radius: 25,
        maxOpacity: 0.6,
        minOpacity: 0,
        blur: 0.9,
        backgroundColor: 'rgba(0, 0, 0, 0)',
      })
    } catch (error) {
      console.error("Error creating heatmap instance:", error)
    }

    // Load persisted heatmap data from Firestore
    this.loadHeatmapData()

    // Add event listeners to capture user interactions
    this.addEventListeners()
  },
  methods: {
    addEventListeners() {
      document.addEventListener('click', this.handleClick)
      document.addEventListener('scroll', this.handleScroll, { passive: true })
      document.addEventListener('mousemove', this.debouncedHandleMouseMove)
    },
    handleClick(event) {
      try {
        const { x, y } = this.getRelativeCoordinates(event, this.$refs.heatmapContainer)
        const point = { x, y, value: 5, timestamp: Date.now() }
        // Add data to the heatmap overlay
        this.heatmapInstance.addData(point)
        // Save the event data to Firestore
        this.saveHeatmapData(point)
      } catch (error) {
        console.error("Error processing click event:", error)
      }
    },
    handleScroll(event) {
      try {
        console.log("Scroll event detected:", window.scrollX, window.scrollY)
        // Optionally, record scroll events or adjust the heatmap accordingly.
      } catch (error) {
        console.error("Error processing scroll event:", error)
      }
    },
    debouncedHandleMouseMove(event) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.handleMouseMove(event)
      }, 200)
    },
    handleMouseMove(event) {
      try {
        const { x, y } = this.getRelativeCoordinates(event, this.$refs.heatmapContainer)
        const point = { x, y, value: 1, timestamp: Date.now() }
        // Optionally, add the point to the heatmap if you want to track mouse movement.
        // this.heatmapInstance.addData(point)
      } catch (error) {
        console.error("Error processing mouse move event:", error)
      }
    },
    getRelativeCoordinates(event, container) {
      if (!container) throw new Error("Container element is missing")
      const rect = container.getBoundingClientRect()
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    },
    async saveHeatmapData(point) {
      try {
        // Save the heatmap data point to Firestore collection "heatmapData"
        await db.collection('heatmapData').add(point)
      } catch (error) {
        console.error("Error saving heatmap data:", error)
      }
    },
    async loadHeatmapData() {
      try {
        const snapshot = await db.collection('heatmapData').get()
        const points = []
        snapshot.forEach(doc => {
          const data = doc.data()
          if (typeof data.x === 'number' && typeof data.y === 'number') {
            points.push({ x: data.x, y: data.y, value: data.value || 1 })
          }
        })
        // Merge the loaded data into the heatmap instance.
        this.heatmapInstance.setData({ max: 10, data: points })
      } catch (error) {
        console.error("Error loading heatmap data:", error)
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('mousemove', this.debouncedHandleMouseMove)
  }
}
</script>

<style scoped>
.heatmap-container {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}
</style>
