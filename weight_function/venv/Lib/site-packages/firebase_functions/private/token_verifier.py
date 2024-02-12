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
"""
Module for internal token verification.
"""
from firebase_admin import _token_gen, exceptions, _auth_utils, initialize_app, get_app, _apps, _DEFAULT_APP_NAME
from google.auth import jwt
import google.auth.exceptions
import google.oauth2.id_token
import google.oauth2.service_account


# pylint: disable=consider-using-f-string
# mypy: ignore-errors
# TODO remove once firebase-admin supports this directly.
# Modified from src/firebase_admin/_token_gen.py to add
# support for app_check tokens (expected_audience kwarg and
# usage are new, plus None for audience on google.oauth2.id_token.verify_token call)
class _JWTVerifier:
    """Verifies Firebase JWTs (ID tokens or session cookies)."""

    def __init__(self, **kwargs):
        self.project_id = kwargs.pop('project_id')
        self.short_name = kwargs.pop('short_name')
        self.operation = kwargs.pop('operation')
        self.url = kwargs.pop('doc_url')
        self.cert_url = kwargs.pop('cert_url')
        self.issuer = kwargs.pop('issuer')
        self.expected_audience = kwargs.pop('expected_audience')
        if self.short_name[0].lower() in 'aeiou':
            self.articled_short_name = 'an {0}'.format(self.short_name)
        else:
            self.articled_short_name = 'a {0}'.format(self.short_name)
        self._invalid_token_error = kwargs.pop('invalid_token_error')
        self._expired_token_error = kwargs.pop('expired_token_error')

    def verify(self, token, request):
        """Verifies the signature and data for the provided JWT."""
        token = token.encode('utf-8') if isinstance(token, str) else token
        if not isinstance(token, bytes) or not token:
            raise ValueError(
                'Illegal {0} provided: {1}. {0} must be a non-empty '
                'string.'.format(self.short_name, token))

        if not self.project_id:
            raise ValueError(
                'Failed to ascertain project ID from the credential or the environment. Project '
                'ID is required to call {0}. Initialize the app with a credentials.Certificate '
                'or set your Firebase project ID as an app option. Alternatively set the '
                'GOOGLE_CLOUD_PROJECT environment variable.'.format(
                    self.operation))

        header, payload = self._decode_unverified(token)
        issuer = payload.get('iss')
        audience = payload.get('aud')
        subject = payload.get('sub')
        expected_issuer = self.issuer + self.project_id

        project_id_match_msg = (
            'Make sure the {0} comes from the same Firebase project as the service account used '
            'to authenticate this SDK.'.format(self.short_name))
        verify_id_token_msg = (
            'See {0} for details on how to retrieve {1}.'.format(
                self.url, self.short_name))

        emulated = _auth_utils.is_emulated()

        error_message = None
        if audience == _token_gen.FIREBASE_AUDIENCE:
            error_message = ('{0} expects {1}, but was given a custom '
                             'token.'.format(self.operation,
                                             self.articled_short_name))
        elif not emulated and not header.get('kid'):
            if header.get('alg') == 'HS256' and payload.get(
                    'v') == 0 and 'uid' in payload.get('d', {}):
                error_message = (
                    '{0} expects {1}, but was given a legacy custom '
                    'token.'.format(self.operation, self.articled_short_name))
            else:
                error_message = 'Firebase {0} has no "kid" claim.'.format(
                    self.short_name)
        elif not emulated and header.get('alg') != 'RS256':
            error_message = (
                'Firebase {0} has incorrect algorithm. Expected "RS256" but got '
                '"{1}". {2}'.format(self.short_name, header.get('alg'),
                                    verify_id_token_msg))
        elif not emulated and self.expected_audience and self.expected_audience not in audience:
            error_message = (
                'Firebase {0} has incorrect "aud" (audience) claim. Expected "{1}" but '
                'got "{2}". {3} {4}'.format(self.short_name,
                                            self.expected_audience, audience,
                                            project_id_match_msg,
                                            verify_id_token_msg))
        elif not emulated and not self.expected_audience and audience != self.project_id:
            error_message = (
                'Firebase {0} has incorrect "aud" (audience) claim. Expected "{1}" but '
                'got "{2}". {3} {4}'.format(self.short_name, self.project_id,
                                            audience, project_id_match_msg,
                                            verify_id_token_msg))
        elif issuer != expected_issuer:
            error_message = (
                'Firebase {0} has incorrect "iss" (issuer) claim. Expected "{1}" but '
                'got "{2}". {3} {4}'.format(self.short_name, expected_issuer,
                                            issuer, project_id_match_msg,
                                            verify_id_token_msg))
        elif subject is None or not isinstance(subject, str):
            error_message = ('Firebase {0} has no "sub" (subject) claim. '
                             '{1}'.format(self.short_name, verify_id_token_msg))
        elif not subject:
            error_message = (
                'Firebase {0} has an empty string "sub" (subject) claim. '
                '{1}'.format(self.short_name, verify_id_token_msg))
        elif len(subject) > 128:
            error_message = (
                'Firebase {0} has a "sub" (subject) claim longer than 128 characters. '
                '{1}'.format(self.short_name, verify_id_token_msg))

        if error_message:
            raise self._invalid_token_error(error_message)

        try:
            if emulated:
                verified_claims = payload
            else:
                verified_claims = google.oauth2.id_token.verify_token(
                    token,
                    request=request,
                    # If expected_audience is set then we have already verified
                    # the audience above.
                    audience=(None
                              if self.expected_audience else self.project_id),
                    certs_url=self.cert_url)
            verified_claims['uid'] = verified_claims['sub']
            return verified_claims
        except google.auth.exceptions.TransportError as error:
            raise _token_gen.CertificateFetchError(str(error), cause=error)
        except ValueError as error:
            if 'Token expired' in str(error):
                raise self._expired_token_error(str(error), cause=error)
            raise self._invalid_token_error(str(error), cause=error)

    def _decode_unverified(self, token):
        try:
            header = jwt.decode_header(token)
            payload = jwt.decode(token, verify=False)
            return header, payload
        except ValueError as error:
            raise self._invalid_token_error(str(error), cause=error)


class InvalidAuthBlockingTokenError(exceptions.InvalidArgumentError):
    """The provided auth blocking token is not a token."""

    default_message = 'The provided auth blocking token is invalid'

    def __init__(self, message, cause=None, http_response=None):
        exceptions.InvalidArgumentError.__init__(self, message, cause,
                                                 http_response)


class ExpiredAuthBlockingTokenError(InvalidAuthBlockingTokenError):
    """The provided auth blocking token is expired."""

    def __init__(self, message, cause):
        InvalidAuthBlockingTokenError.__init__(self, message, cause)


class AuthBlockingTokenVerifier(_token_gen.TokenVerifier):
    """Verifies auth blocking tokens."""

    def __init__(self, app):
        super().__init__(app)
        self.auth_blocking_token_verifier = _JWTVerifier(
            project_id=app.project_id,
            short_name='Auth Blocking token',
            operation='verify_auth_blocking_token()',
            doc_url=
            'https://cloud.google.com/identity-platform/docs/blocking-functions',
            cert_url=_token_gen.ID_TOKEN_CERT_URI,
            issuer=_token_gen.ID_TOKEN_ISSUER_PREFIX,
            invalid_token_error=InvalidAuthBlockingTokenError,
            expired_token_error=ExpiredAuthBlockingTokenError,
            expected_audience='run.app',  # v2 only
        )

    def verify_auth_blocking_token(self, auth_blocking_token):
        return self.auth_blocking_token_verifier.verify(
            auth_blocking_token,
            self.request,
        )


def verify_auth_blocking_token(auth_blocking_token):
    """Verifies the provided auth blocking token."""
    if _DEFAULT_APP_NAME not in _apps:
        initialize_app()
    return AuthBlockingTokenVerifier(
        get_app()).verify_auth_blocking_token(auth_blocking_token)
