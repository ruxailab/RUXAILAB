import requests
import json
import os
import re
import logging
from datetime import datetime, timedelta, timezone
from urllib.parse import quote
from typing import List, Dict, Any, Tuple

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
GITHUB_ACCEPT_HEADER = "application/vnd.github.v3+json"

class Config:
    """Configuration class for the integration"""
    SONARCLOUD_URL = "https://sonarcloud.io"
    PROJECT_KEY = "ruxailab_RUXAILAB"
    ORGANIZATION_KEY = "ruxailab"
    SONAR_TOKEN = os.environ.get("SONAR_TOKEN")
    PAT_TOKEN = os.environ.get("PAT_TOKEN")
    MIN_SEVERITY = "MAJOR"
    GITHUB_REPO_OWNER = "ruxailab"
    GITHUB_REPO_NAME = "RUXAILAB"
    ISSUES_LOOKBACK_DAYS = 1 
    REQUEST_TIMEOUT = 30
    MAX_RETRIES = 3
    DUPLICATE_GITHUB_ISSUES_CHECK_COUNT = 500
    SEVERITY_LEVELS = {
        "BLOCKER": 5,
        "CRITICAL": 4,
        "MAJOR": 3,
        "MINOR": 2,
        "INFO": 1
    }

def get_sonarcloud_issues() -> List[Dict[str, Any]]:
    """
    Fetch new issues from SonarCloud.
    Returns:
        List of SonarCloud issues.
    """
    issues, page, page_size = [], 1, 100
    lookback_date = (datetime.now(timezone.utc) - timedelta(days=Config.ISSUES_LOOKBACK_DAYS)).date().isoformat()
    severities = ",".join(sev for sev, level in Config.SEVERITY_LEVELS.items() if level >= Config.SEVERITY_LEVELS.get(Config.MIN_SEVERITY, 2))

    url = f"{Config.SONARCLOUD_URL}/api/issues/search"
    headers = {"Authorization": f"Bearer {Config.SONAR_TOKEN}"}

    while True:
        params = {
            "componentKeys": Config.PROJECT_KEY,
            "organization": Config.ORGANIZATION_KEY,
            "resolved": "false",
            "severities": severities,
            "statuses": "OPEN,CONFIRMED",
            "createdAfter": lookback_date,
            "p": page,
            "ps": page_size
        }

        try:
            for attempt in range(Config.MAX_RETRIES):
                try:
                    response = requests.get(url, params=params, headers=headers, timeout=Config.REQUEST_TIMEOUT)
                    response.raise_for_status()
                    break
                except requests.RequestException as e:
                    if attempt < Config.MAX_RETRIES - 1:
                        logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying...")
                        continue
                    raise

            data = response.json()
            issues.extend(data.get("issues", []))

            if page * page_size >= data.get("total", 0):
                break
            page += 1

        except requests.RequestException as e:
            logger.error(f"Error fetching SonarCloud issues: {str(e)}")
            break

    return issues

def get_existing_github_issues() -> Dict[str, Any]:
    """
    Get existing Github issues to check for duplicates.
    Returns:
        Dict mapping SonarCloud issue keys to GitHub issue data.
    """
    existing_issues = {}
    page, issue_count, per_page = 1, 0, 100
    max_issues = Config.DUPLICATE_GITHUB_ISSUES_CHECK_COUNT

    url = f"https://api.github.com/repos/{Config.GITHUB_REPO_OWNER}/{Config.GITHUB_REPO_NAME}/issues"
    headers = {
        "Authorization": f"token {Config.PAT_TOKEN}",
        "Accept": GITHUB_ACCEPT_HEADER
    }

    while issue_count < max_issues:
        try:
            response = requests.get(
                url, headers=headers,
                params={"state": "all", "labels": "sonarcloud", "per_page": per_page, "page": page},
                timeout=Config.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            issues = response.json()

            if not issues:
                break

            for issue in issues:
                body = issue.get("body", "")
                match = re.search(r"issues=([^&]+)&", body)
                if match:
                    existing_issues[match.group(1)] = issue

            issue_count += len(issues)
            if len(issues) < per_page:
                break
            page += 1

        except requests.RequestException as e:
            logger.error(f"Error fetching GitHub issues: {str(e)}")
            break

    logger.info(f"Found {len(existing_issues)} existing GitHub issues with SonarCloud labels.")
    return existing_issues

def get_next_github_issue_number() -> int:
    """
    Get the next GitHub issue number by finding the highest current issue number
    
    Returns:
        int: The next issue number (current highest + 1)
    """
    url = f"https://api.github.com/repos/{Config.GITHUB_REPO_OWNER}/{Config.GITHUB_REPO_NAME}/issues"
    params = {
        "state": "all",
        "per_page": 1,
        "sort": "created", 
        "direction": "desc"
    }

    headers = {
        "Authorization": f"token {Config.PAT_TOKEN}",
        "Accept": GITHUB_ACCEPT_HEADER
    }

    try:
        for attempt in range(Config.MAX_RETRIES):
            try:
                response = requests.get(
                    url, 
                    params=params, 
                    headers=headers, 
                    timeout=Config.REQUEST_TIMEOUT
                )
                response.raise_for_status()

                issues = response.json()
                if issues:
                    return issues[0]["number"] + 1
                else:
                    return 1

            except requests.RequestException as e:
                if attempt < Config.MAX_RETRIES - 1:
                    logger.warning(f"Attempt {attempt+1} failed when getting next issue number: {str(e)}. Retrying...")
                    continue
                raise

    except Exception as e:
        logger.error(f"Error determining next GitHub issue number: {str(e)}")
        return 0

def create_github_issue(issue: Dict[str, Any], next_number: int) -> Tuple[bool, int]:
    """
    Create a Github issue from a SonarCloud issue
    
    Args:
        issue: SonarCloud issue data
        next_number: Expected issue number to include in the title
        
    Returns:
        Tuple[bool, int]: Success status and actual issue number
    """
    url = f"https://api.github.com/repos/{Config.GITHUB_REPO_OWNER}/{Config.GITHUB_REPO_NAME}/issues"

    component = issue.get('component', '')
    file_path = component.replace(f"{Config.PROJECT_KEY}:", "")
    line = issue.get('line', 'Unknown')
    issue_key = issue.get('key', '')
    severity = issue.get('severity', '')
    issue_type = issue.get('type', '')
    message = issue.get('message', '')
    rule = issue.get('rule', '')

    title_prefix = f"#{next_number}" if next_number > 0 else ""
    title = f"{title_prefix} [{severity}] {issue_type}: {message[:80]}{'...' if len(message) > 80 else ''}"

    body = f"""
## SonarCloud Issue: {title_prefix}
### Issue Details:
- **Rule**: [{rule}]({Config.SONARCLOUD_URL}/organizations/{Config.ORGANIZATION_KEY}/rules?open={quote(rule, safe="")}&rule_key={quote(rule, safe="")})
- **Severity**: {severity}
- **Type**: {issue_type}
- **File**: `{file_path}`
- **Line**: {line}
- **SonarCloud Issue Key**: `{issue_key}`
### Issue Message:
> {message}
### Relevant Links:
- [View Issue in SonarCloud]({Config.SONARCLOUD_URL}/project/issues?id={Config.PROJECT_KEY}&issues={issue_key}&open={issue_key})
- [SonarCloud Rule Definition]({Config.SONARCLOUD_URL}/organizations/{Config.ORGANIZATION_KEY}/rules?open={quote(rule, safe="")}&rule_key={quote(rule, safe="")})
"""

    data = {
        "title": title,
        "body": body,
        "labels": ["sonarcloud", f"{severity.lower()}", f"{issue_type.lower()}"]
    }

    headers = {
        "Authorization": f"token {Config.PAT_TOKEN}",
        "Accept": GITHUB_ACCEPT_HEADER
    }

    try:
        for attempt in range(Config.MAX_RETRIES):
            try:
                response = requests.post(
                    url, 
                    headers=headers, 
                    data=json.dumps(data),
                    timeout=Config.REQUEST_TIMEOUT
                )
                response.raise_for_status()

                result = response.json()
                issue_url = result.get('html_url', '')
                actual_number = result.get('number', 0)
                logger.info(f"Created GitHub issue #{actual_number}: {issue_url}")
                return True, actual_number
            except requests.RequestException as e:
                if attempt < Config.MAX_RETRIES - 1:
                    logger.warning(f"Attempt {attempt+1} failed: {str(e)}. Retrying...")
                    continue
                raise
    except requests.RequestException as e:
        logger.error(f"Error creating GitHub issue: {str(e)}")
        return False, 0

def should_create_issue(issue: Dict[str, Any], existing_issues: Dict[str, Any]) -> bool:
    """
    Determine if an issue should trigger GitHub issue creation
    
    Args:
        issue: SonarCloud issue data
        existing_issues: Dictionary of existing GitHub issues keyed by SonarCloud issue key
        
    Returns:
        bool: True if issue should be created, False otherwise
    """
    issue_key = issue.get('key', '')

    # Check if we already have an issue for this SonarCloud issue
    if issue_key in existing_issues:
        logger.info(f"Skipping issue {issue_key} - Already exists as GitHub issue #{existing_issues[issue_key].get('number')}")
        return False

    return True

def check_prerequisites() -> bool:
    """
    Check if all require environment variables are set
    
    Returns:
        bool: True if all prerequisites are met, else False
    """
    missing = []

    if not Config.SONAR_TOKEN:
        missing.append("SONAR_TOKEN")
    if not Config.PAT_TOKEN:
        missing.append("PAT_TOKEN")

    if missing:
        logger.error(f"Missing required environment variables: {', '.join(missing)}")
        return False

    return True

def main() -> None:
    """
    Main function to fetch issues from SonarCloud and create issues on Github
    """
    logger.info("Starting SonarCloud to GitHub integration")

    if not check_prerequisites():
        return

    try:
        logger.info("Fetching existing GitHub issues for deduplication check")
        existing_issues = get_existing_github_issues()

        logger.info("Fetching issues from SonarCloud")
        issues = get_sonarcloud_issues()

        if not issues:
            logger.info("No new issues found")
            return

        severities = ",".join(sev for sev, level in Config.SEVERITY_LEVELS.items() if level >= Config.SEVERITY_LEVELS.get(Config.MIN_SEVERITY, 2))

        logger.info(f"Fetching SonarCloud issues with severities: {severities} (Min Severity: {Config.MIN_SEVERITY}) - Found {len(issues)} issues")

        next_issue_number = get_next_github_issue_number()
        logger.info(f"Next expected GitHub issue number: #{next_issue_number}")

        created_count = 0
        duplicate_count = 0
        current_number = next_issue_number

        for issue in issues:
            if should_create_issue(issue, existing_issues):
                logger.info(f"Creating Github issue (expected #{current_number}) for: {issue.get('message', '')[:80]}...")
                success, actual_number = create_github_issue(issue, current_number)
                if success:
                    created_count += 1
                    existing_issues[issue.get('key', '')] = {"number": actual_number}
                    if actual_number > 0:
                        current_number = actual_number + 1
                    else:
                        current_number += 1
            else:
                duplicate_count += 1
                logger.debug(f"Skipping duplicate issue: {issue.get('message', '')[:80]}...")

        logger.info(f"Process completed. Created {created_count} issues, found {duplicate_count} duplicate issues")

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()

