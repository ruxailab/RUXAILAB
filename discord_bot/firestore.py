# firebase_demo.py

# Import required modules
import firebase_admin
from firebase_admin import credentials, firestore
import json

if not firebase_admin._apps:
    cred = credentials.Certificate("discord_bot/credentials.json")
    firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Load data from JSON files
with open('contributions.json', 'r') as f:
    contributions = json.load(f)

# with open('user_mappings.json', 'r') as f:
#     user_mappings = json.load(f)

# Function to update a user document in Firestore
def update_user_in_firestore(discord_id, pr_count, issues_count, commits_count):
    doc_ref = db.collection('discord').document(discord_id)
    doc = doc_ref.get()
    if doc.exists:
        # Update existing document
        doc_ref.update({
            'pr_count': pr_count,
            'issues_count': issues_count,
            'commits_count': commits_count
        })

# Update Firestore with contributions data
for github_id, user_data in contributions.items():
    # Query Firestore to find the document with the matching GitHub ID
    docs = db.collection('discord').where('github_id', '==', github_id).stream()
    for doc in docs:
        discord_id = doc.id
        update_user_in_firestore(
            discord_id,
            user_data.get('pr_count', 0),
            user_data.get('issues_count', 0),
            user_data.get('commits_count', 0)
        )

print("Firestore update completed.")

# Remove any Realtime Database references
# Firestore does not use db.reference()

# Function to load data from Firestore
def load_data_from_firestore():
    contributions = {}
    user_mappings = {}

    # Fetch all documents in the 'discord' collection
    docs = db.collection('discord').stream()

    for doc in docs:
        data = doc.to_dict()
        discord_id = doc.id
        github_id = data.get('github_id')
        
        # Populate contributions and user_mappings
        contributions[github_id] = {
            'pr_count': data.get('pr_count', 0),
            'issues_count': data.get('issues_count', 0),
            'commits_count': data.get('commits_count', 0)
        }
        user_mappings[discord_id] = github_id

    return contributions, user_mappings

# Example usage
contributions, user_mappings = load_data_from_firestore()
print(contributions)
print(user_mappings)
