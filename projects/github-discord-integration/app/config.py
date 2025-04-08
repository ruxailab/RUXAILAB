# app/config.py

import os
import yaml
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Core Discord configuration
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DISCORD_GUILD_ID = int(os.getenv("DISCORD_GUILD_ID", 0))
NOTIFICATION_CHANNEL_ID = int(os.getenv("NOTIFICATION_CHANNEL_ID", 0))
SUMMARY_CHANNEL_ID = int(os.getenv("SUMMARY_CHANNEL_ID", 0))
BOT_OWNER_ID = int(os.getenv("BOT_OWNER_ID", 0))

# GitHub configuration
GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET")

# Role configuration
ROLES_CONFIG = []
ROLE_MAP_BY_ID = {}

# Load roles from YAML
try:
    with open("config/roles.yaml", "r", encoding="utf-8") as f:
        roles_data = yaml.safe_load(f)
        if roles_data and "roles" in roles_data:
            for role_name, role_data in roles_data["roles"].items():
                role_id = int(os.getenv(role_data["id_env_var"], 0))
                if role_id:
                    role_config = {
                        "id": role_id,
                        "name": role_data["name"],
                        "emoji": role_data.get("emoji", ""),
                        "description": role_data.get("description", ""),
                        "criteria": role_data.get("criteria", {}),
                        "operator": role_data.get("criteria", {}).get("operator", "AND").upper()
                    }
                    ROLES_CONFIG.append(role_config)
                    ROLE_MAP_BY_ID[role_id] = role_config
except Exception as e:
    logger.error(f"Failed to load roles configuration: {e}")