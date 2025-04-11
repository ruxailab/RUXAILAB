# TemplateGitHub

Current implementation is shown in the template discord server https://discord.gg/R7kkg4j6W6 while tracking the RUXAILAB repository

To activate the discord bot:

0.1 (optional) python -m venv venv
0.2 (optional) source venv/bin/activate

1. run pip install -r requirements.txt
2. run python bot.py

Future feature:

1. add workflows folder in project directory to implement automatic refresh of data whenever someone sends a PR

OverView:

bot.py: Main logic of the bot

github_links.json: Maps GitHub usernames to Discord users

requirements.txt: Python dependencies

.env: Secret token for Discord bot (not committed)
