import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from role_utils import determine_role

# ---------- Firebase Initialization ----------
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate("credentials.json")
        firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Firebase init error: {e}")
    exit(1)

# ---------- Firestore Helper Functions ----------
def update_user_in_firestore(discord_id, pr_count, issues_count, commits_count):
    doc_ref = db.collection('discord').document(discord_id)
    doc = doc_ref.get()
    
    # Determine the role using the determine_role function
    pr_role, issue_role, commit_role = determine_role(pr_count, issues_count, commits_count)
    # Format the roles as a comma-separated string
    role = ', '.join(filter(None, [pr_role, issue_role, commit_role]))  # Filter out None values and join

    data = {
        'pr_count': pr_count,
        'issues_count': issues_count,
        'commits_count': commits_count,
        'role': role  # Update the role field
    }

    if doc.exists:
        doc_ref.update(data)
    else:
        # Optional: set default values for missing fields
        doc_ref.set({
            **data,
            'github_id': None
        })

def load_data_from_firestore():
    contributions = {}
    user_mappings = {}

    try:
        docs = db.collection('discord').stream()
        for doc in docs:
            if not doc.exists:
                continue

            data = doc.to_dict()
            github_id = data.get('github_id')
            if not github_id:
                continue

            discord_id = doc.id
            contributions[github_id] = {
                'pr_count': data.get('pr_count', 0),
                'issues_count': data.get('issues_count', 0),
                'commits_count': data.get('commits_count', 0)
            }
            user_mappings[discord_id] = github_id
    except Exception as e:
        print(f"Firestore read error: {e}")

    return contributions, user_mappings

# ---------- Load JSON Contributions ----------
if not os.path.exists('contributions.json'):
    with open('contributions.json', 'w') as f:
        json.dump({}, f)

with open('contributions.json', 'r') as f:
    try:
        contributions = json.load(f)
    except json.JSONDecodeError:
        print("Invalid JSON format in contributions.json.")
        contributions = {}

# ---------- Sync to Firestore ----------
for github_id, user_data in contributions.items():
    try:
        docs = db.collection('discord').where('github_id', '==', github_id).stream()
        for doc in docs:
            if not doc.exists:
                continue
            discord_id = doc.id
            update_user_in_firestore(
                discord_id,
                user_data.get('pr_count', 0),
                user_data.get('issues_count', 0),
                user_data.get('commits_count', 0)
            )
    except Exception as e:
        print(f"Error updating Firestore for GitHub user {github_id}: {e}")

print("Firestore update completed.")
