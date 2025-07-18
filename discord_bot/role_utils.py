PR_THRESHOLDS = {
    "⚪ Member (General)": 0,
    "🟣 Entry": 1,
    "🔵 Intermediate": 4,
    "🔵 Proficient": 7,
    "🟢 Advanced": 10,
    "🟡 Expert": 20,
    "🟠 Master": 40,
    "🔴 Grandmaster": 60
}

ISSUE_THRESHOLDS = {
    "📝 Bug Reporter": 1,
    "🔍 Debugger": 3,
    "🕵️‍♂️ Investigator": 7
}

COMMIT_THRESHOLDS = {
    "🔧 Committer": 10,
    "🚀 Commit Machine": 30
}

def determine_role(pr_count, issues_count, commits_count):
    # Determine PR role
    pr_role = "⚪ Member (General)"
    for role, threshold in PR_THRESHOLDS.items():
        if pr_count >= threshold:
            pr_role = role

    # Determine issue role
    issue_role = None
    for role, threshold in ISSUE_THRESHOLDS.items():
        if issues_count >= threshold:
            issue_role = role

    # Determine commit role
    commit_role = None
    for role, threshold in COMMIT_THRESHOLDS.items():
        if commits_count >= threshold:
            commit_role = role

    # Return the highest role in each category
    return pr_role, issue_role, commit_role 