import json
from typing import Any
from firebase_functions import https_fn, options
from firebase_admin import db, initialize_app
import google.cloud.firestore
import functions_framework

initialize_app()

@functions_framework.http
def cors_enabled(request):
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)
    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}
    return ("Hello World!", 200, headers)


@https_fn.on_request()
def HWexample(req:  https_fn.Request) -> https_fn.Response:
 return https_fn.Response("Hello world!")

@https_fn.on_request(
    cors=options.CorsOptions(
        cors_origins=[r"firebase\.com$",  r"http://localhost:8080"],
        cors_methods=["get", "post"],
    )
)
def say_hello(req: https_fn.Request) -> https_fn.Response:
    response_data = {
        "message": "Hello world!"
    }
    return https_fn.Response(json.dumps(response_data), content_type="application/json")

@https_fn.on_call()
def addmessage(req: https_fn.CallableRequest) -> Any:
    return("Deu certo!")