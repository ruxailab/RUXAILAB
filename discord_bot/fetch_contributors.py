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
    """Fetch contribution data for a user."""
    headers = {
        "Authorization": f"token {os.getenv('GITHUB_TOKEN')}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # Get merged PRs
    prs_url = f"{GITHUB_API_URL}/search/issues?q=repo:{REPO_OWNER}/{REPO_NAME}+type:pr+author:{username}+is:merged"
    prs_response = requests.get(prs_url, headers=headers)
    pr_count = prs_response.json().get("total_count", 0) if prs_response.status_code == 200 else 0
    
    # Get issues opened
    issues_url = f"{GITHUB_API_URL}/search/issues?q=repo:{REPO_OWNER}/{REPO_NAME}+type:issue+author:{username}"
    issues_response = requests.get(issues_url, headers=headers)
    issues_count = issues_response.json().get("total_count", 0) if issues_response.status_code == 200 else 0
    
    # Get commits (last 30 days)
    thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    commits_url = f"{GITHUB_API_URL}/search/commits?q=repo:{REPO_OWNER}/{REPO_NAME}+author:{username}+author-date:>{thirty_days_ago}"
    commits_response = requests.get(commits_url, headers=headers)
    commits_count = commits_response.json().get("total_count", 0) if commits_response.status_code == 200 else 0
    
    return {
        "username": username,
        "pr_count": pr_count,
        "issues_count": issues_count,
        "commits_count": commits_count
    }

def determine_role(pr_count, issues_count, commits_count):
    """Determine role based on contribution counts."""
    # PR-based roles
    if pr_count >= 60:
        return "🔴 Grandmaster"
    elif pr_count >= 40:
        return "🟠 Master"
    elif pr_count >= 20:
        return "🟡 Expert"
    elif pr_count >= 10:
        return "🟢 Advanced"
    elif pr_count >= 7:
        return "🔵 Proficient"
    elif pr_count >= 4:
        return "🔵 Intermediate"
    elif pr_count >= 1:
        return "🟣 Entry"
    
    # Issue-based roles
    if issues_count >= 7:
        return "🕵️‍♂️ Investigator"
    elif issues_count >= 3:
        return "🔍 Debugger"
    elif issues_count >= 1:
        return "📝 Bug Reporter"
    
    # Commit-based roles
    if commits_count >= 30:
        return "🚀 Commit Machine"
    elif commits_count >= 10:
        return "🔧 Committer"
    
    return "⚪ Member (General)"

if __name__ == "__main__":
    # Test with a sample user
    test_username = "marcgc21"  # Using one of the contributors from the main repo
    contributions = get_contributions(test_username)
    role = determine_role(
        contributions["pr_count"],
        contributions["issues_count"],
        contributions["commits_count"]
    )
    
    print(f"User: {test_username}")
    print(f"PRs: {contributions['pr_count']}")
    print(f"Issues: {contributions['issues_count']}")
    print(f"Commits: {contributions['commits_count']}")
    print(f"Role: {role}")
    
    # Save to a JSON file for the Discord bot to use
    with open("contributions.json", "w") as f:
        json.dump(contributions, f, indent=2) 