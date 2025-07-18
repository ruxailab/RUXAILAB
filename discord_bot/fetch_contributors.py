import os
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GITHUB_API_URL = "https://api.github.com"
REPO_OWNER = os.getenv("REPO_OWNER", "ruxailab")
REPO_NAME = os.getenv("REPO_NAME", "RUXAILAB")

def get_contributions(username):
    """Fetch all-time contribution data for a user."""
    headers = {
        "Authorization": f"token {os.getenv('GITHUB_TOKEN')}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # Get merged PRs (all time)
    prs_url = f"{GITHUB_API_URL}/search/issues?q=repo:{REPO_OWNER}/{REPO_NAME}+type:pr+author:{username}+is:merged"
    prs_response = requests.get(prs_url, headers=headers)
    pr_count = prs_response.json().get("total_count", 0) if prs_response.status_code == 200 else 0
    
    # Get issues opened (all time)
    issues_url = f"{GITHUB_API_URL}/search/issues?q=repo:{REPO_OWNER}/{REPO_NAME}+type:issue+author:{username}"
    issues_response = requests.get(issues_url, headers=headers)
    issues_count = issues_response.json().get("total_count", 0) if issues_response.status_code == 200 else 0
    
    # Get commits (all time)
    commits_url = f"{GITHUB_API_URL}/search/commits?q=repo:{REPO_OWNER}/{REPO_NAME}+author:{username}"
    commits_response = requests.get(commits_url, headers=headers)
    commits_count = commits_response.json().get("total_count", 0) if commits_response.status_code == 200 else 0
    
    return {
        "pr_count": pr_count,
        "issues_count": issues_count,
        "commits_count": commits_count
    }

def fetch_all_contributors():
    """Fetch all contributors to the repository."""
    headers = {
        "Authorization": f"token {os.getenv('GITHUB_TOKEN')}",
        "Accept": "application/vnd.github.v3+json"
    }
    contributors_url = f"{GITHUB_API_URL}/repos/{REPO_OWNER}/{REPO_NAME}/contributors"
    response = requests.get(contributors_url, headers=headers)
    if response.status_code == 200:
        return [contributor['login'] for contributor in response.json()]
    else:
        print(f"Failed to fetch contributors: {response.status_code}")
        return []

if __name__ == "__main__":
    all_contributions = {}
    contributors = fetch_all_contributors()
    for username in contributors:
        contributions = get_contributions(username)
        all_contributions[username] = contributions
        print(f"User: {username}")
        print(f"PRs: {contributions['pr_count']}")
        print(f"Issues: {contributions['issues_count']}")
        print(f"Commits: {contributions['commits_count']}")
    
    # Save to a JSON file for the Discord bot to use
    with open("contributions.json", "w") as f:
        json.dump(all_contributions, f, indent=2) 
