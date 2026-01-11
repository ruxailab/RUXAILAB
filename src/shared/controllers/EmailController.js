import axios from "axios";

export default class EmailController {
  constructor() {
    let baseUrl = process.env.VUE_APP_CLOUD_FUNCTIONS_URL || "http://127.0.0.1:5003/retlab-dev/us-central1";
    baseUrl = baseUrl.trim();
    baseUrl = baseUrl.replace(/^["']+|["']+$/g, ''); 
    baseUrl = baseUrl.replace(/\/+$/, '');
    this.baseUrl = baseUrl;
  }

  async send(payload) {
    try {
      const functionsUrl = `${this.baseUrl}/sendEmail`;
      const response = await axios.post(
        functionsUrl,
        { data: payload },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
            
      return {
        success: true,
        message: "Email sent successfully.",
        data: response.data,
      };
    } catch (error) {      
      console.error('Email sending failed:', error);
      
      if (error.code === "ERR_NETWORK" || error.message.includes("Network Error") || error.message.includes("CORS")) {
        return await this.sendWithFetch(payload);
      }
      
      let errorMessage = "Failed to send email";
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.statusText || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Check if Firebase emulators are running.";
      } else {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        details: error.response?.data,
        error: error
      };
    }
  }

  async sendWithFetch(payload) {
    try {
      const functionsUrl = `${this.baseUrl}/sendEmail`;      
      const response = await fetch(functionsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: payload }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: "Email sent successfully (via fetch).",
          data: data,
        };
      } else {
        console.error('Fetch fallback failed:', data);
        return {
          success: false,
          message: data.error || `Fetch failed with status ${response.status}`,
          details: data,
        };
      }
    } catch (error) {
      console.error("Fetch fallback also failed:", error);
      const isLocalhost = this.baseUrl.includes('127.0.0.1') || this.baseUrl.includes('localhost');
      let message = "Network error. ";
      message += isLocalhost 
        ? "Please check if Firebase emulators are running on port 5003."
        : "Unable to connect to Cloud Functions.";
      
      return {
        success: false,
        message: message,
        error: error.message
      };
    }
  }
  
  // Helper method to check if emulator is running
  async checkHealth() {
    try {
      const response = await axios.get(this.baseUrl, { timeout: 5000 });
      return {
        healthy: true,
        url: this.baseUrl,
        environment: this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1') ? 'development' : 'production'
      };
    } catch (error) {
      return {
        healthy: false,
        url: this.baseUrl,
        error: error.message,
        suggestion: this.baseUrl.includes('localhost') ? 
          'Make sure Firebase emulators are running: firebase emulators:start' :
          'Check Cloud Functions deployment and permissions'
      };
    }
  }
}