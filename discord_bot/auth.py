import os
import threading
import webbrowser
import time
from flask import Flask, redirect, url_for, request, session
from flask_dance.contrib.github import make_github_blueprint, github
from dotenv import load_dotenv

# Setup
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "super-secret-key")

github_blueprint = make_github_blueprint(
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET")
)
app.register_blueprint(github_blueprint, url_prefix="/github_login")

# Shared storage + shutdown signal
github_username_result = {"username": None}
server_should_stop = threading.Event()

@app.route("/")
def github_login(): 
    # session.clear()
    if not github.authorized:
        return redirect(url_for("github.login"))

    resp = github.get("/user")
    if resp.ok:
        github_username_result["username"] = resp.json()["login"]
        server_should_stop.set()  # tell the thread to stop
        return f"<h1>Login successful, you can close this tab.</h1>"

    return "<h1>Login failed</h1>"

def run_flask():
    # session.clear()
    app.run(port=5000, debug=False, use_reloader=False)

def get_github_username(): 
    # session.clear()
    # Open browser to trigger login
    webbrowser.open("http://127.0.0.1:5000")
    
    # Run Flask in a separate thread
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()

    # Wait for login to finish
    while not server_should_stop.is_set():
        time.sleep(0.1)

    return github_username_result["username"]

# Demo usage
if __name__ == "__main__":
    username = get_github_username()
    print(f"GitHub username is: {username}")
