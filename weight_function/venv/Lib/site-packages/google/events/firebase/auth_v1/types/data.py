# -*- coding: utf-8 -*-
# Copyright 2023 Google LLC
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
#
from __future__ import annotations

from typing import MutableMapping, MutableSequence

import proto  # type: ignore

from google.protobuf import struct_pb2  # type: ignore
from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.firebase.auth.v1',
    manifest={
        'AuthEventData',
        'UserMetadata',
        'UserInfo',
    },
)


class AuthEventData(proto.Message):
    r"""The data within all Firebase Auth events.

    Attributes:
        uid (str):
            The user identifier in the Firebase app.
        email (str):
            The user's primary email, if set.
        email_verified (bool):
            Whether or not the user's primary email is
            verified.
        display_name (str):
            The user's display name.
        photo_URL (str):
            The user's photo URL.
        disabled (bool):
            Whether the user is disabled.
        metadata (google.events.firebase.auth_v1.types.UserMetadata):
            Additional metadata about the user.
        provider_data (MutableSequence[google.events.firebase.auth_v1.types.UserInfo]):
            User's info at the providers
        phone_number (str):
            The user's phone number.
        custom_claims (google.protobuf.struct_pb2.Struct):
            User's custom claims, typically used to
            define user roles and propagated to an
            authenticated user's ID token.
    """

    uid: str = proto.Field(
        proto.STRING,
        number=1,
    )
    email: str = proto.Field(
        proto.STRING,
        number=2,
    )
    email_verified: bool = proto.Field(
        proto.BOOL,
        number=3,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=4,
    )
    photo_URL: str = proto.Field(
        proto.STRING,
        number=5,
    )
    disabled: bool = proto.Field(
        proto.BOOL,
        number=6,
    )
    metadata: 'UserMetadata' = proto.Field(
        proto.MESSAGE,
        number=7,
        message='UserMetadata',
    )
    provider_data: MutableSequence['UserInfo'] = proto.RepeatedField(
        proto.MESSAGE,
        number=8,
        message='UserInfo',
    )
    phone_number: str = proto.Field(
        proto.STRING,
        number=9,
    )
    custom_claims: struct_pb2.Struct = proto.Field(
        proto.MESSAGE,
        number=10,
        message=struct_pb2.Struct,
    )


class UserMetadata(proto.Message):
    r"""Additional metadata about the user.

    Attributes:
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            The date the user was created.
        last_sign_in_time (google.protobuf.timestamp_pb2.Timestamp):
            The date the user last signed in.
    """

    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    last_sign_in_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )


class UserInfo(proto.Message):
    r"""User's info at the identity provider

    Attributes:
        uid (str):
            The user identifier for the linked provider.
        email (str):
            The email for the linked provider.
        display_name (str):
            The display name for the linked provider.
        photo_URL (str):
            The photo URL for the linked provider.
        provider_id (str):
            The linked provider ID (e.g. "google.com" for
            the Google provider).
    """

    uid: str = proto.Field(
        proto.STRING,
        number=1,
    )
    email: str = proto.Field(
        proto.STRING,
        number=2,
    )
    display_name: str = proto.Field(
        proto.STRING,
        number=3,
    )
    photo_URL: str = proto.Field(
        proto.STRING,
        number=4,
    )
    provider_id: str = proto.Field(
        proto.STRING,
        number=5,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
