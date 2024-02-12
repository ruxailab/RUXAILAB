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
"""Cloud functions to handle Eventarc events."""

# pylint: disable=protected-access,cyclic-import
import typing as _typing
import functools as _functools
import datetime as _dt
import dataclasses as _dataclasses

import firebase_functions.options as _options
import firebase_functions.private.util as _util
from flask import (
    Request as _Request,
    Response as _Response,
)


@_dataclasses.dataclass(frozen=True)
class AuthUserInfo:
    """
    User info that is part of the AuthUserRecord.
    """
    uid: str
    """The user identifier for the linked provider."""

    provider_id: str
    """The linked provider ID (e.g., "google.com" for the Google provider)."""

    display_name: str | None = None
    """The display name for the linked provider."""

    email: str | None = None
    """The email for the linked provider."""

    photo_url: str | None = None
    """The photo URL for the linked provider."""

    phone_number: str | None = None
    """The phone number for the linked provider."""


@_dataclasses.dataclass(frozen=True)
class AuthUserMetadata:
    """
    Additional metadata about the user.
    """
    creation_time: _dt.datetime
    """The date the user was created."""

    last_sign_in_time: _typing.Optional[_dt.datetime]
    """The date the user last signed in."""


@_dataclasses.dataclass(frozen=True)
class AuthMultiFactorInfo:
    """
    Interface representing the common properties of a user-enrolled second factor.
    """

    uid: str
    """
    The ID of the enrolled second factor. This ID is unique to the user.
    """

    display_name: str | None
    """
    The optional display name of the enrolled second factor.
    """

    factor_id: str
    """
    The type identifier of the second factor. For SMS second factors, this is `phone`.
    """

    enrollment_time: _dt.datetime | None
    """
    The optional date the second factor was enrolled.
    """

    phone_number: str | None
    """
    The phone number associated with a phone second factor.
    """


@_dataclasses.dataclass(frozen=True)
class AuthMultiFactorSettings:
    """
    The multi-factor related properties for the current user, if available.
    """

    enrolled_factors: list[AuthMultiFactorInfo]
    """
    List of second factors enrolled with the current user.
    """


@_dataclasses.dataclass(frozen=True)
class AuthUserRecord:
    """
    The UserRecord passed to auth blocking Cloud Functions from the identity platform.
    """

    uid: str
    """
    The user's `uid`.
    """

    email: str | None
    """
    The user's primary email, if set.
    """

    email_verified: bool | None
    """
    Whether or not the user's primary email is verified.
    """

    display_name: str | None
    """
    The user's display name.
    """

    photo_url: str | None
    """
    The user's photo URL.
    """

    phone_number: str | None
    """
    The user's primary phone number, if set.
    """

    disabled: bool
    """
    Whether or not the user is disabled: `true` for disabled; `false` for enabled.
    """

    metadata: AuthUserMetadata
    """
    Additional metadata about the user.
    """

    provider_data: list[AuthUserInfo]
    """
    An array of providers (e.g., Google, Facebook) linked to the user.
    """

    password_hash: str | None
    """
    The user's hashed password (base64-encoded).
    """

    password_salt: str | None
    """
    The user's password salt (base64-encoded).
    """

    custom_claims: dict[str, _typing.Any] | None
    """
    The user's custom claims object if available.
    """

    tenant_id: str | None
    """
    The ID of the tenant the user belongs to, if available.
    """

    tokens_valid_after_time: _dt.datetime | None
    """The date the user's tokens are valid after."""

    multi_factor: AuthMultiFactorSettings | None
    """The multi-factor related properties for the current user, if available."""


@_dataclasses.dataclass(frozen=True)
class AdditionalUserInfo:
    """
    The additional user info component of the auth event context.
    """

    provider_id: str
    """The provider identifier."""

    profile: dict[str, _typing.Any] | None
    """The user's profile data as a dictionary."""

    username: str | None
    """The user's username, if available."""

    is_new_user: bool
    """A boolean indicating if the user is new or not."""


@_dataclasses.dataclass(frozen=True)
class Credential:
    """
    The credential component of the auth event context.
    """

    claims: dict[str, _typing.Any] | None
    """The user's claims data as a dictionary."""

    id_token: str | None
    """The user's ID token."""

    access_token: str | None
    """The user's access token."""

    refresh_token: str | None
    """The user's refresh token."""

    expiration_time: _dt.datetime | None
    """The expiration time of the user's access token."""

    secret: str | None
    """The user's secret."""

    provider_id: str
    """The provider identifier."""

    sign_in_method: str
    """The user's sign-in method."""


@_dataclasses.dataclass(frozen=True)
class AuthBlockingEvent:
    """
    Defines an auth event for identitytoolkit v2 auth blocking events.
    """

    data: AuthUserRecord
    """
    The UserRecord passed to auth blocking Cloud Functions from the identity platform.
    """

    locale: str | None
    """
    The application locale. You can set the locale using the client SDK,
    or by passing the locale header in the REST API.
    Example: 'fr' or 'sv-SE'
    """

    event_id: str
    """
    The event's unique identifier.
    Example: 'rWsyPtolplG2TBFoOkkgyg'
    """

    ip_address: str
    """
    The IP address of the device the end user is registering or signing in from.
    Example: '114.14.200.1'
    """

    user_agent: str
    """
    The user agent triggering the blocking function.
    Example: 'Mozilla/5.0 (X11; Linux x86_64)'
    """

    additional_user_info: AdditionalUserInfo
    """An object containing information about the user."""

    credential: Credential | None
    """An object containing information about the user's credential."""

    timestamp: _dt.datetime
    """
    The time the event was triggered."""


class BeforeCreateResponse(_typing.TypedDict, total=False):
    """
    The handler response type for 'before_user_created' blocking events.
    """

    display_name: str | None
    """The user's display name."""

    disabled: bool | None
    """Whether or not the user is disabled."""

    email_verified: bool | None
    """Whether or not the user's primary email is verified."""

    photo_url: str | None
    """The user's photo URL."""

    custom_claims: dict[str, _typing.Any] | None
    """The user's custom claims object if available."""


class BeforeSignInResponse(BeforeCreateResponse, total=False):
    """
    The handler response type for 'before_user_signed_in' blocking events.
    """

    session_claims: dict[str, _typing.Any] | None
    """The user's session claims object if available."""


BeforeUserCreatedCallable = _typing.Callable[[AuthBlockingEvent],
                                             BeforeCreateResponse | None]
"""
The type of the callable for 'before_user_created' blocking events.
"""

BeforeUserSignedInCallable = _typing.Callable[[AuthBlockingEvent],
                                              BeforeSignInResponse | None]
"""
The type of the callable for 'before_user_signed_in' blocking events.
"""


@_util.copy_func_kwargs(_options.BlockingOptions)
def before_user_signed_in(
    **kwargs,
) -> _typing.Callable[[BeforeUserSignedInCallable], BeforeUserSignedInCallable]:
    """
    Handles an event that is triggered before a user is signed in.

    Example:

    .. code-block:: python

      from firebase_functions import identity_fn

      @identity_fn.before_user_signed_in()
      def example(event: identity_fn.AuthBlockingEvent) -> identity_fn.BeforeSignInResponse | None:
          pass

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.BlockingOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.identity_fn.AuthBlockingEvent` \\],
            :exc:`firebase_functions.identity_fn.BeforeSignInResponse` \\| `None` \\]
            A function that takes a AuthBlockingEvent and optionally returns BeforeSignInResponse.
    """
    options = _options.BlockingOptions(**kwargs)

    def before_user_signed_in_decorator(func: BeforeUserSignedInCallable):
        from firebase_functions.private._identity_fn import event_type_before_sign_in

        @_functools.wraps(func)
        def before_user_signed_in_wrapped(request: _Request) -> _Response:
            from firebase_functions.private._identity_fn import before_operation_handler
            return before_operation_handler(
                func,
                event_type_before_sign_in,
                request,
            )

        _util.set_func_endpoint_attr(
            before_user_signed_in_wrapped,
            options._endpoint(
                func_name=func.__name__,
                event_type=event_type_before_sign_in,
            ),
        )
        _util.set_required_apis_attr(
            before_user_signed_in_wrapped,
            options._required_apis(),
        )
        return before_user_signed_in_wrapped

    return before_user_signed_in_decorator


@_util.copy_func_kwargs(_options.BlockingOptions)
def before_user_created(
    **kwargs,
) -> _typing.Callable[[BeforeUserCreatedCallable], BeforeUserCreatedCallable]:
    """
    Handles an event that is triggered before a user is created.

    Example:

    .. code-block:: python

      from firebase_functions import identity_fn

      @identity_fn.before_user_created()
      def example(event: identity_fn.AuthBlockingEvent) -> identity_fn.BeforeCreateResponse | None:
          pass

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.BlockingOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.identity_fn.AuthBlockingEvent` \\],
            :exc:`firebase_functions.identity_fn.BeforeCreateResponse` \\| `None` \\]
            A function that takes a AuthBlockingEvent and optionally returns BeforeCreateResponse.
    """
    options = _options.BlockingOptions(**kwargs)

    def before_user_created_decorator(func: BeforeUserCreatedCallable):
        from firebase_functions.private._identity_fn import event_type_before_create

        @_functools.wraps(func)
        def before_user_created_wrapped(request: _Request) -> _Response:
            from firebase_functions.private._identity_fn import before_operation_handler
            return before_operation_handler(
                func,
                event_type_before_create,
                request,
            )

        _util.set_func_endpoint_attr(
            before_user_created_wrapped,
            options._endpoint(
                func_name=func.__name__,
                event_type=event_type_before_create,
            ),
        )
        _util.set_required_apis_attr(
            before_user_created_wrapped,
            options._required_apis(),
        )
        return before_user_created_wrapped

    return before_user_created_decorator
