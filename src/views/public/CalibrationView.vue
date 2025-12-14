<template>
  <div class="calibration-container">
    <h1>Eye Tracking Calibration</h1>
    <div class="camera-container">
      <video ref="cameraVideo" autoplay playsinline muted class="camera-feed"></video>
      <div id="calibration-points">
        <div id="point1" class="calibration-point"></div>
        <div id="point2" class="calibration-point"></div>
        <div id="point3" class="calibration-point"></div>
        <div id="point4" class="calibration-point"></div>
        <div id="point5" class="calibration-point"></div>
      </div>
      <div v-if="!cameraActive" class="camera-overlay">
        <div class="camera-permission-prompt">
          <div class="camera-icon">📹</div>
          <p>Camera access is required for eye tracking calibration</p>
        </div>
      </div>
    </div>
    <button id="startCalibration" @click="startCalibration" :disabled="!cameraActive && cameraPermissionRequested">
      {{ cameraActive ? 'Start Calibration' : cameraPermissionRequested ? 'Requesting Camera...' : 'Enable Camera' }}
    </button>
    <div id="completion-section" class="completion-section" style="display: none;">
      <div class="completion-message">
        <div class="success-icon">✅</div>
        <h2>Calibration Complete!</h2>
        <p>Your eye tracking has been calibrated successfully.</p>
      </div>
      <button id="closeBtn" @click="closeWindow" class="close-button">Close Calibration</button>
    </div>
    <p id="status">Click "Enable Camera" to begin.</p>
  </div>
</template>

<script>
export default {
  name: 'CalibrationView',
  data() {
    return {
      auth: null,
      testId: null,
      cameraActive: false,
      cameraPermissionRequested: false,
      stream: null,
    };
  },
  mounted() {
    // Get auth and test params from query
    this.auth = this.$route.query.auth;
    this.testId = this.$route.query.test;
    if (!this.auth) {
      alert('No auth provided');
      return;
    }

    // Set up calibration points
    this.setupCalibrationPoints();
  },
  beforeUnmount() {
    // Stop camera stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  },
  methods: {
    setupCalibrationPoints() {
      const points = [
        { id: 'point1', x: 10, y: 10 },
        { id: 'point2', x: 90, y: 10 },
        { id: 'point3', x: 50, y: 50 },
        { id: 'point4', x: 10, y: 90 },
        { id: 'point5', x: 90, y: 90 },
      ];

      points.forEach(point => {
        const el = document.getElementById(point.id);
        el.style.left = point.x + '%';
        el.style.top = point.y + '%';
      });
    },
    async requestCameraAccess() {
      try {
        this.cameraPermissionRequested = true;
        const constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.$refs.cameraVideo.srcObject = this.stream;
        this.cameraActive = true;

        document.getElementById('status').textContent = 'Camera enabled! Click "Start Calibration" to begin.';
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Camera access is required for calibration. Please allow camera access and try again.');
        this.cameraPermissionRequested = false;
      }
    },
    async startCalibration() {
      if (!this.cameraActive) {
        await this.requestCameraAccess();
        return;
      }

      document.getElementById('startCalibration').style.display = 'none';
      document.getElementById('status').textContent = 'Click on the red points as they appear to calibrate your eye tracking.';
      this.showNextPoint(0);
    },
    showNextPoint(index) {
      const points = ['point1', 'point2', 'point3', 'point4', 'point5'];
      if (index >= points.length) {
        // Calibration complete
        document.getElementById('status').style.display = 'none';
        document.getElementById('completion-section').style.display = 'block';
        this.endCalibration();
        return;
      }
      const pointId = points[index];
      const point = document.getElementById(pointId);
      point.style.display = 'block';
      point.onclick = () => {
        point.style.display = 'none';
        this.showNextPoint(index + 1);
      };
    },
    async endCalibration() {
      // Get screen dimensions
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      // Dummy calibration data
      const calibrationData = { dummy: true };

      // Send data to Firebase function
      await this.sendCalibrationData(screenWidth, screenHeight, calibrationData);

      // Data sent, wait for user to close
    },
    closeWindow() {
      // Stop camera stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // Notify parent window
      localStorage.setItem('calibrationCompleted', 'true');
      // Close window after a short delay
      setTimeout(() => window.close(), 100);
    },
    async sendCalibrationData(screenWidth, screenHeight, k) {
      const isDev = process.env.NODE_ENV === 'development';
      const url = isDev 
        ? 'http://localhost:5001/ruxailab/us-central1/receiveCalibration'
        : 'https://us-central1-ruxailab.cloudfunctions.net/receiveCalibration';
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: this.auth,
            screen_height: screenHeight,
            screen_width: screenWidth,
            k: k,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send calibration data');
        }

        console.log('Calibration data sent successfully');
      } catch (error) {
        console.error('Error sending calibration data:', error);
      }
    },
  },
};
</script>

<style scoped>
.calibration-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
  font-family: 'Roboto', sans-serif;
}

.camera-container {
  position: relative;
  width: 640px;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror the video for natural feel */
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.camera-permission-prompt {
  text-align: center;
  padding: 20px;
}

.camera-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.completion-section {
  text-align: center;
  margin-top: 20px;
}

.completion-message {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.completion-message h2 {
  color: #4caf50;
  margin: 10px 0;
  font-size: 24px;
}

.completion-message p {
  color: #666;
  margin: 0;
  font-size: 16px;
}

.close-button {
  background-color: #00213F;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calibration-point {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: red;
  border-radius: 50%;
  display: none;
  z-index: 1000;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  animation: pulse 1s infinite;
  border: 3px solid white;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

button {
  padding: 12px 24px;
  font-size: 16px;
  margin: 10px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  background-color: #00213F;
  color: white;
  transition: background-color 0.3s;
  font-weight: 500;
}

button:hover:not(:disabled) {
  background-color: #00213F;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>