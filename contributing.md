# Contributing to RUXAILAB

Thank you for considering contributing to **RUXAILAB**! We welcome all contributions that improve the project, whether it's fixing bugs, adding features, improving documentation, or anything else.

Please follow these guidelines to ensure a smooth contribution process.

---

## How to Contribute

There are several ways to contribute:
- **Bug Reports**: Report issues by creating a [GitHub Issue](https://github.com/ruxailab/RUXAILAB/issues).
- **Feature Requests**: Suggest new features by opening an issue.
- **Code Contributions**: Submit pull requests (PRs) for bug fixes or new features.
- **Documentation Improvements**: Help improve the documentation.

---

## Getting Started

### 1. Fork the Repository
Click the **Fork** button at the top right of the repository.

### 2. Clone the Repository
Run the following command in your terminal:
```sh
git clone https://github.com/ruxailab/RUXAILAB.git
```

### 3. Navigate to the Project Directory
```sh
cd RUXAILAB
```

### 4. Install Dependencies
```sh
npm install
```

### 5. Setup Environment Variables
Copy the example environment file:
```sh
cp .env.example .env
```
Then, check the contents using:
```sh
cat .env
```
You'll see Firebase-related configuration variables such as:
```env
VUE_APP_FIREBASE_API_KEY=""
VUE_APP_FIREBASE_AUTH_DOMAIN=""
VUE_APP_FIREBASE_STORAGE_BUCKET=""
VUE_APP_FIREBASE_DB_URL=""
VUE_APP_FIREBASE_PROJECT_ID=""
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=""
VUE_APP_FIREBASE_APP_ID=""
VUE_APP_I18N_LOCALE=""
VUE_APP_I18N_FALLBACK_LOCALE=""
VUE_APP_FIREBASE_PYTHON_FUNCTION=""
LARAVEL_PDF=""
```
Fill in the required values before proceeding.

---

## Running the Project

### 6. Start the Server
Run the following command to start the development server:
```sh
npm run server
```
**Note**: The website will not run yet because Firebase needs to be set up first.

### 7. Setup Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/) and create an account.
2. Generate API keys and add them to your `.env` file.

### 8. Start Firebase Emulators
Once Firebase is set up, run the following command in your terminal inside the project directory:
```sh
firebase emulators:start
```
Now, the project should be running successfully. 🎉

---
## Need Help?
If you have any questions, feel free to open an issue in the repository. Happy contributing! 🚀

