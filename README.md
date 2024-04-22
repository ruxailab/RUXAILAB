<div align="center">
  <h1>Welcome to UX Remote LAB</h1>
  <p><strong>UX Remote LAB</strong> is a user-friendly platform for usability testing and heuristic evaluation. Designed and provided by <a href="https://retlab-dev.firebaseapp.com/">UX Remote LAB</a>, it is a web application developed to assist project creators in gathering valuable insights from their users.</p>
</div>

<div align="center">
  <a href="https://retlab-dev.firebaseapp.com/"><strong>Read The Docs</strong></a>
</div>
<div align="center">
  <a href="https://retlab-dev.firebaseapp.com/">Live Demo</a>
</div>

<hr />
<div align="center">
  <table >
    <tr>
      <td><img src="public/HomePic.png" alt="User Friendly" width="600"/></td>
      <td>User Friendly</td>
    </tr>
    <tr>
      <td><img src="public/TestPic.png" alt="Heuristics Tests" width="600"/></td>
      <td>Heuristics Tests</td>
    </tr>
    <tr>
      <td><img src="public/AnswersPic.png" alt="Answers Views" width="600"/></td>
      <td>Answers Views</td>
    </tr>
    <tr>
      <td><img src="public/AnalyticsPic.png" alt="Analytics Graphs" width="600"/></td>
      <td>Analytics Graphs</td>
    </tr>
  </table>
</div>

## About

UX Remote LAB is an open-source platform designed to collect usability feedback from users. It allows you to gather user reviews, analyze them, and create comprehensive reports to better understand your application's usability. Additionally, it offers heuristic tests, enabling experts to evaluate your application's compliance with usability principles.

### Community & Experience

UX Remote LAB provides a collaborative environment for creators to share their projects and receive voluntary assistance with usability reviews. You can communicate with evaluators and send them invitations for testing your applications.

### Support

- [Report a Bug 🐛](https://github.com/uramakilab/remote-usability-lab/issues/new)
- [Request a Feature 🚀](https://github.com/uramakilab/remote-usability-lab/issues/new)
- [Ask a Question 🤗](https://github.com/uramakilab/remote-usability-lab/discussions)

For commercial support, academic collaborations, and answers to common questions, please use [Get Support]() to contact us.
### Development Environment

- Node.js version: ≤ 16.20.1
- Vue.js version: 2.6.12
- Vue CLI version: 4.3.1
- Vuetify version: 2.3.10

## Video Guide

<a href='https://youtu.be/dAf4LRxITCc'>Tutorial - Running RUXAILAB with Firebase Emulators   🖥️</a>

## Getting Started

Follow these steps to set up the development environment and run the application locally:

   ```bash
   # Install dependencies
   npm install
   ```
 Open Firebase / Firestore and start a project.

   - In the project dashboard, click on the settings button on the left side of the screen (gear icon).
  - In the project settings, under the general tab, scroll down to the end of the screen, you should find the following screen. 
<div align="center">
  <img src="public/FBexample.png" alt="FBexample" height="450" />
</div> 

In the folder of your project, create a file with the name .env and put the following data:

  ```javascript
  VUE_APP_FIREBASE_API_KEY_DEV=""
  VUE_APP_FIREBASE_AUTH_DOMAIN_DEV=""
  VUE_APP_FIREBASE_DB_URL_DEV=""
  VUE_APP_FIREBASE_PROJECT_ID_DEV=""
  VUE_APP_FIREBASE_STORAGE_BUCKET_DEV=""
  VUE_APP_FIREBASE_MESSAGING_SENDER_ID_DEV=""
  VUE_APP_FIREBASE_APP_ID_DEV=""

  // Doesn't need changes
  VUE_APP_I18N_LOCALE_DEV="en"
  VUE_APP_I18N_FALLBACK_LOCALE_DEV="en"
  ```
Then, complete the information in your .env file with the firebase information, respectively in their fields, and run:

  ```bash
   # Run the application locally
   npm run serve
   ```




## Docker Setup



### Building the Docker Image

To build the Docker image for UX Remote LAB, navigate to the project's root directory and run the following command:

```bash
docker build -t uxremotelab .
```

### Running the Application using Docker

After building the image, you can run the application in a Docker container using:

 
Note: Ensure you have created the .env file and filled it with all required variables before running the following command:
  

```bash
docker run -d --env-file .env -p 5000:5000 uxremotelab
```

Visit `http://localhost:5000` in your browser to access the UX Remote LAB platform.





## License

MIT © [UX Remote LAB](https://github.com/uramakilab/remote-usability-lab)
