# Discord Bot for RUXAILAB

A Discord bot that integrates with GitHub to track user contributions and manage Discord roles based on contribution metrics.

## Requirements

- **Python 3.13** - The bot requires Python 3.13 for compatibility with all dependencies
- Google Cloud account with billing enabled
- ngrok account for OAuth tunneling

## Project Structure

- **auth.py** - GitHub OAuth authentication system using Flask and ngrok
- **init_discord_bot.py** - Main Discord bot initialization and command handling
- **discord_bot_requirements.txt** - Python dependencies
- **deploy.sh** - Deployment script for Google Cloud Run
- **Dockerfile** - Container configuration for Docker deployment
- **entrypoint.sh** - Container entry script for environment setup and health checks
- **fetch_contributors.py** - GitHub API integration to fetch contributor data
- **firestore.py** - Firestore database operations for storing user data
- **role_utils.py** - Utility functions for determining Discord roles
- **update_discord_roles.py** - Script to update Discord roles based on GitHub activity

## Authentication Flow

The bot uses GitHub OAuth for authentication:
1. User initiates auth with `/link` command
2. Bot starts a Flask server and ngrok tunnel
3. User authenticates via GitHub
4. GitHub username is stored in Firestore linked to Discord ID

## Deployment

### Local Development

1. Ensure Python 3.13 is installed:
   ```bash
   python --version  # Should return Python 3.13.x
   ```

2. Create a `.env` file with required credentials:
   ```
   DISCORD_BOT_TOKEN=your_token
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NGROK_DOMAIN=your_ngrok_domain
   SECRET_KEY=random_secret_key
   ```

3. Install dependencies:
   ```bash
   pip install -r discord_bot_requirements.txt
   ```

4. Run the bot:
   ```bash
   python init_discord_bot.py
   ```

### Google Cloud Run Deployment

1. Set up Google Cloud:
   - Create a Google Cloud project
   - Enable Cloud Run API and Container Registry API
   - Set up billing
   - Install Google Cloud CLI (`gcloud`)

2. Configure Google Cloud CLI:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. Prepare service account credentials:
   - Create a service account with Firestore access
   - Download credentials as JSON to `credentials.json`

4. Update the `deploy.sh` script with your project details:
   ```bash
   # Edit these variables in deploy.sh
   PROJECT_ID="your-project-id"
   REGION="us-central1"
   SERVICE_NAME="discord-bot"
   ```

5. Run the deployment script:
   ```bash
   bash deploy.sh
   ```

6. The deployment creates a Cloud Run service that:
   - Runs in a containerized environment
   - Scales automatically (currently configured for 1 instance)
   - Has a public HTTPS endpoint
   - Uses a custom domain if configured

7. To remove deployed resources (if needed):
   ```bash
   # Delete the Cloud Run service
   gcloud run services delete discord-bot --region=us-central1
   
   # Delete the container images
   gcloud container images delete gcr.io/finaltest-b0895/discord-bot --force-delete-tags
   ```

## Important Notes

### Environment Configuration

- The authentication is configured to always use ngrok tunneling
- Environment variables set in Cloud Run are explicitly ignored in `auth.py` to prevent URL conflicts
- When deploying to Cloud Run, environment variables persist between deployments

### Known Issues

- Cloud Run deployments retain environment variables from previous deployments
- If previous deployments used different URLs, they might cause conflicts
- The current solution removes any Cloud Run environment variables at runtime to ensure consistent ngrok usage 