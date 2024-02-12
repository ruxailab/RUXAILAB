# Copyright 2022 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Module for functions that listen to HTTPS endpoints.
These can be raw web requests and Callable RPCs.
"""
# pylint: disable=protected-access
import dataclasses as _dataclasses
import functools as _functools
import typing as _typing
import typing_extensions as _typing_extensions
import enum as _enum
import json as _json
import firebase_functions.private.util as _util
import firebase_functions.core as _core
from functions_framework import logging as _logging

from firebase_functions.options import HttpsOptions, _GLOBAL_OPTIONS
from flask import Request, Response, make_response as _make_response, jsonify as _jsonify
from flask_cors import cross_origin as _cross_origin


class FunctionsErrorCode(str, _enum.Enum):
    """
    The set of Cloud Functions status codes. The codes are the same as the
    ones exposed by gRPC here:
    https://github.com/grpc/grpc/blob/master/doc/statuscodes.md
    """

    OK = "ok"

    CANCELLED = "cancelled"
    """
    The operation was cancelled (typically by the caller).
    """

    UNKNOWN = "unknown"
    """
    Unknown error or an error from a different error domain.
    """

    INVALID_ARGUMENT = "invalid-argument"
    """
    Client specified an invalid argument. Note that this
    differs from `failed-precondition`. `invalid-argument` indicates
    arguments that are problematic regardless of the state of the system
    (such as an invalid field name).
    """

    DEADLINE_EXCEEDED = "deadline-exceeded"
    """
    Deadline expired before operation could complete.
    For operations that change the state of the system, this error may be
    returned even if the operation has completed successfully. For example,
    a successful response from a server could have been delayed long enough
    for the deadline to expire.
    """

    NOT_FOUND = "not-found"
    """
    Some requested document was not found.
    """

    ALREADY_EXISTS = "already-exists"
    """
    Some document that we attempted to create already
    exists.
    """

    PERMISSION_DENIED = "permission-denied"
    """
    The caller does not have permission to execute the
    specified operation.
    """

    UNAUTHENTICATED = "unauthenticated"
    """
    The request does not have valid authentication
    credentials for the operation.
    """

    RESOURCE_EXHAUSTED = "resource-exhausted"
    """
    Some resource has been exhausted, perhaps a
    per-user quota, or perhaps the entire file system is out of space.
    """

    FAILED_PRECONDITION = "failed-precondition"
    """
    Operation was rejected because the system is not
    in a state required for the operation's execution.
    """

    ABORTED = "aborted"
    """
    The operation was aborted, typically due to a concurrency
    issue like transaction aborts, etc.
    """

    OUT_OF_RANGE = "out-of-range"
    """
    Operation was attempted past the valid range.
    """

    UNIMPLEMENTED = "unimplemented"
    """
    Operation is not implemented or not supported/enabled.
    """

    INTERNAL = "internal"
    """
    Internal errors. Means some invariants expected by
    underlying system have been broken. If you see one of these errors,
    something is very broken.
    """

    UNAVAILABLE = "unavailable"
    """
    The service is currently unavailable. This is most likely
    a transient condition and may be corrected by retrying with a backoff.
    """

    DATA_LOSS = "data-loss"
    """
    Unrecoverable data loss or corruption.
    """


class _CanonicalErrorCodeName(str, _enum.Enum):
    """The canonical error code name for a given error code."""

    OK = "OK"
    CANCELLED = "CANCELLED"
    UNKNOWN = "UNKNOWN"
    INVALID_ARGUMENT = "INVALID_ARGUMENT"
    DEADLINE_EXCEEDED = "DEADLINE_EXCEEDED"
    NOT_FOUND = "NOT_FOUND"
    ALREADY_EXISTS = "ALREADY_EXISTS"
    PERMISSION_DENIED = "PERMISSION_DENIED"
    UNAUTHENTICATED = "UNAUTHENTICATED"
    RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED"
    FAILED_PRECONDITION = "FAILED_PRECONDITION"
    ABORTED = "ABORTED"
    OUT_OF_RANGE = "OUT_OF_RANGE"
    UNIMPLEMENTED = "UNIMPLEMENTED"
    INTERNAL = "INTERNAL"
    UNAVAILABLE = "UNAVAILABLE"
    DATA_LOSS = "DATA_LOSS"


@_dataclasses.dataclass(frozen=True)
class _HttpErrorCode:
    """
    A standard error code that will be returned to the client. This also
    determines the HTTP status code of the response, as defined in code.proto.
    """

    canonical_name: _CanonicalErrorCodeName
    status: int


_error_code_map = {
    FunctionsErrorCode.OK:
        _HttpErrorCode(_CanonicalErrorCodeName.OK, 200),
    FunctionsErrorCode.CANCELLED:
        _HttpErrorCode(_CanonicalErrorCodeName.CANCELLED, 499),
    FunctionsErrorCode.UNKNOWN:
        _HttpErrorCode(_CanonicalErrorCodeName.UNKNOWN, 500),
    FunctionsErrorCode.INVALID_ARGUMENT:
        _HttpErrorCode(_CanonicalErrorCodeName.INVALID_ARGUMENT, 400),
    FunctionsErrorCode.DEADLINE_EXCEEDED:
        _HttpErrorCode(_CanonicalErrorCodeName.DEADLINE_EXCEEDED, 504),
    FunctionsErrorCode.NOT_FOUND:
        _HttpErrorCode(_CanonicalErrorCodeName.NOT_FOUND, 404),
    FunctionsErrorCode.ALREADY_EXISTS:
        _HttpErrorCode(_CanonicalErrorCodeName.ALREADY_EXISTS, 409),
    FunctionsErrorCode.PERMISSION_DENIED:
        _HttpErrorCode(_CanonicalErrorCodeName.PERMISSION_DENIED, 403),
    FunctionsErrorCode.UNAUTHENTICATED:
        _HttpErrorCode(_CanonicalErrorCodeName.UNAUTHENTICATED, 401),
    FunctionsErrorCode.RESOURCE_EXHAUSTED:
        _HttpErrorCode(_CanonicalErrorCodeName.RESOURCE_EXHAUSTED, 429),
    FunctionsErrorCode.FAILED_PRECONDITION:
        _HttpErrorCode(_CanonicalErrorCodeName.FAILED_PRECONDITION, 400),
    FunctionsErrorCode.ABORTED:
        _HttpErrorCode(_CanonicalErrorCodeName.ABORTED, 409),
    FunctionsErrorCode.OUT_OF_RANGE:
        _HttpErrorCode(_CanonicalErrorCodeName.OUT_OF_RANGE, 400),
    FunctionsErrorCode.UNIMPLEMENTED:
        _HttpErrorCode(_CanonicalErrorCodeName.UNIMPLEMENTED, 501),
    FunctionsErrorCode.INTERNAL:
        _HttpErrorCode(_CanonicalErrorCodeName.INTERNAL, 500),
    FunctionsErrorCode.UNAVAILABLE:
        _HttpErrorCode(_CanonicalErrorCodeName.UNAVAILABLE, 503),
    FunctionsErrorCode.DATA_LOSS:
        _HttpErrorCode(_CanonicalErrorCodeName.DATA_LOSS, 500),
}
"""
Standard error codes and HTTP statuses for different ways a request can fail,
as defined by:
https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto.
This map is used primarily to convert from a client error code string to
to the HTTP format error code string and status, and make sure it's in the
supported set.
"""


class _HttpErrorWireFormat(_typing.TypedDict):
    details: _typing_extensions.NotRequired[_typing.Any]
    status: str
    message: str


class HttpsError(Exception):
    """
    An explicit error that can be thrown from a handler to send an error to the
    client that called the function.
    """

    code: FunctionsErrorCode
    """
    A standard error code that will be returned to the client. This also
    determines the HTTP status code of the response.
    """

    details: _typing.Any | None = None
    """
    Extra data to be converted to JSON and included in the error response.
    """

    _http_error_code: _HttpErrorCode
    """
    A wire format representation of a provided error code.
    """

    def __init__(
        self,
        code: FunctionsErrorCode,
        message: str,
        details: _typing.Any | None = None,
    ):
        self.code = code
        self.message = message
        self.details = details

        if code not in _error_code_map:
            raise ValueError(f"Unknown error code: ${code}.")

        self._http_error_code = _error_code_map[code]

        super().__init__()

    def _as_dict(self) -> _HttpErrorWireFormat:
        if self.details is None:
            return {
                "status": self._http_error_code.canonical_name.value,
                "message": self.message,
            }

        return {
            "details": self.details,
            "status": self._http_error_code.canonical_name,
            "message": self.message,
        }


@_dataclasses.dataclass(frozen=True)
class AuthData:
    """
    The interface for Auth tokens verified in Callable functions
    """

    uid: str
    """
    User ID of the ID token.
    """

    token: dict[str, _typing.Any]
    """
    The ID token's decoded claims.
    """


@_dataclasses.dataclass(frozen=True)
class AppCheckData:
    """
    The interface for AppCheck tokens verified in Callable functions
    """

    app_id: str
    """
    The App ID corresponding to the App the App Check token belonged to.
    This value is not actually one of the JWT token claims. It is added as a
    convenience, and is set as the value of the token `sub` property.
    """

    token: dict[str, _typing.Any]
    """
    The token's decoded claims.
    """


@_dataclasses.dataclass(frozen=True)
class CallableRequest(_typing.Generic[_core.T]):
    """
    The request used to call a callable function.
    """

    data: _core.T
    """
    The parameters used by a client when calling this function.
    """

    raw_request: Request
    """
    The raw request handled by the callable.
    """

    app: AppCheckData | None = None
    """
    The result of decoding and verifying a Firebase AppCheck token.
    """

    auth: AuthData | None = None
    """"
    The result of decoding and verifying a Firebase Auth ID token.
    """

    instance_id_token: str | None = None
    """
    An unverified token for a Firebase Instance ID.
    """


_C1 = _typing.Callable[[Request], Response]
_C2 = _typing.Callable[[CallableRequest[_typing.Any]], _typing.Any]


def _on_call_handler(func: _C2, request: Request,
                     enforce_app_check: bool) -> Response:
    try:
        if not _util.valid_on_call_request(request):
            _logging.error("Invalid request, unable to process.")
            raise HttpsError(FunctionsErrorCode.INVALID_ARGUMENT, "Bad Request")
        context: CallableRequest = CallableRequest(
            raw_request=request,
            data=_json.loads(request.data)["data"],
        )

        token_status = _util.on_call_check_tokens(request)

        if token_status.auth == _util.OnCallTokenState.INVALID:
            raise HttpsError(FunctionsErrorCode.UNAUTHENTICATED,
                             "Unauthenticated")

        if enforce_app_check and token_status.app in (
                _util.OnCallTokenState.MISSING, _util.OnCallTokenState.INVALID):
            raise HttpsError(FunctionsErrorCode.UNAUTHENTICATED,
                             "Unauthenticated")
        if token_status.app == _util.OnCallTokenState.VALID and token_status.app_token is not None:
            context = _dataclasses.replace(
                context,
                app=AppCheckData(token_status.app_token["sub"],
                                 token_status.app_token),
            )

        if token_status.auth_token is not None:
            context = _dataclasses.replace(
                context,
                auth=AuthData(token_status.auth_token["uid"],
                              token_status.auth_token),
            )

        instance_id = request.headers.get("Firebase-Instance-ID-Token")
        if instance_id is not None:
            # Validating the token requires an http request, so we don't do it.
            # If the user wants to use it for something, it will be validated then.
            # Currently, the only real use case for this token is for sending
            # pushes with FCM. In that case, the FCM APIs will validate the token.
            context = _dataclasses.replace(
                context,
                instance_id_token=request.headers.get(
                    "Firebase-Instance-ID-Token"),
            )
        result = func(context)
        return _jsonify(result=result)
    # Disable broad exceptions lint since we want to handle all exceptions here
    # and wrap as an HttpsError.
    # pylint: disable=broad-except
    except Exception as err:
        if not isinstance(err, HttpsError):
            _logging.error("Unhandled error", err)
            err = HttpsError(FunctionsErrorCode.INTERNAL, "INTERNAL")
        status = err._http_error_code.status
        return _make_response(_jsonify(error=err._as_dict()), status)


@_util.copy_func_kwargs(HttpsOptions)
def on_request(**kwargs) -> _typing.Callable[[_C1], _C1]:
    """
    Handler which handles HTTPS requests.
    Requires a function that takes a ``Request`` and ``Response`` object, 
    the same signature as a Flask app.

    Example:

    .. code-block:: python

      @on_request()
      def example(request: Request) -> Response:
          pass

    :param \\*\\*kwargs: Https options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.HttpsOptions`
    :rtype: :exc:`typing.Callable` \\[ \\[ :exc:`flask.Request` \\], :exc:`flask.Response` \\]
            A function that takes a :exc:`flask.Request` and returns a :exc:`flask.Response`.
    """
    options = HttpsOptions(**kwargs)

    def on_request_inner_decorator(func: _C1):

        @_functools.wraps(func)
        def on_request_wrapped(request: Request) -> Response:
            if options.cors is not None:
                return _cross_origin(
                    methods=options.cors.cors_methods,
                    origins=options.cors.cors_origins,
                )(func)(request)
            return func(request)

        _util.set_func_endpoint_attr(
            on_request_wrapped,
            options._endpoint(func_name=func.__name__),
        )
        return on_request_wrapped

    return on_request_inner_decorator


@_util.copy_func_kwargs(HttpsOptions)
def on_call(**kwargs) -> _typing.Callable[[_C2], _C2]:
    """
    Declares a callable method for clients to call using a Firebase SDK.
    Requires a function that takes a ``CallableRequest``.

    Example:

    .. code-block:: python

      @on_call()
      def example(request: CallableRequest) -> Any:
          return "Hello World"

    :param \\*\\*kwargs: Https options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.HttpsOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.https.CallableRequest` \\[
            :exc:`object` \\] \\], :exc:`object` \\]
            A function that takes a ``CallableRequest`` and returns an :exc:`object`.
    """
    options = HttpsOptions(**kwargs)

    def on_call_inner_decorator(func: _C2):
        origins: _typing.Any = "*"
        if options.cors is not None and options.cors.cors_origins is not None:
            origins = options.cors.cors_origins

        # Default to False.
        enforce_app_check = False
        # If the global option is set, use that.
        if options.enforce_app_check is None and _GLOBAL_OPTIONS.enforce_app_check is not None:
            enforce_app_check = _GLOBAL_OPTIONS.enforce_app_check
        # If the global option is not set, use the local option.
        elif options.enforce_app_check is not None:
            enforce_app_check = options.enforce_app_check

        @_cross_origin(
            methods="POST",
            origins=origins,
        )
        @_functools.wraps(func)
        def on_call_wrapped(request: Request):
            return _on_call_handler(
                func,
                request,
                enforce_app_check,
            )

        _util.set_func_endpoint_attr(
            on_call_wrapped,
            options._endpoint(func_name=func.__name__, callable=True),
        )
        return on_call_wrapped

    return on_call_inner_decorator
