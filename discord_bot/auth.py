import os
import threading
from flask import Flask, redirect, url_for
from flask_dance.contrib.github import make_github_blueprint, github
from dotenv import load_dotenv
from pyngrok import ngrok
from werkzeug.middleware.proxy_fix import ProxyFix

load_dotenv()
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

github_username_result = {"username": None}
username_event = threading.Event()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "super-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# OAuth blueprint
github_blueprint = make_github_blueprint(
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
    redirect_url="https://ruxauth.ngrok.io/callback"  # ✅ custom callback route
)
app.register_blueprint(github_blueprint, url_prefix="/login")

@app.route("/callback")
def github_callback():  # ✅ no conflict with blueprint
    if not github.authorized:
        print("❌ Not authorized, redirecting back to login")
        return redirect(url_for("github.login"))

    resp = github.get("/user")
    if not resp.ok:
        return "GitHub API call failed"

    username = resp.json()["login"]
    if not username_event.is_set():
        github_username_result["username"] = username
        username_event.set()
        print(f"✅ Logged in as GitHub user: {username}")
    return "✅ GitHub login complete! You can close this tab."

@app.route("/")
def index():
    return "Welcome to the GitHub OAuth service. Use /login/github to start."

def start_flask():
    app.run(host="0.0.0.0", port=5001, use_reloader=False)

def start_ngrok():
    public_url = ngrok.connect(
        addr=5001,
        subdomain=os.getenv("NGROK_DOMAIN", None)
    ).public_url
    return public_url

def get_github_username():
    if username_event.is_set():
        username_event.clear()
        github_username_result["username"] = None

    flask_thread = threading.Thread(target=start_flask)
    flask_thread.daemon = True
    flask_thread.start()

    public_url = start_ngrok()
    print(f"Ngrok URL: {public_url}/login/github")

    return public_url + "/login/github"

def wait_for_username():
    username_event.wait()
    return github_username_result["username"]
