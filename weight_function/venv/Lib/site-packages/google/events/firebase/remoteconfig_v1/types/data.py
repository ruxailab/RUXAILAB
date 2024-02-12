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

from google.protobuf import timestamp_pb2  # type: ignore


__protobuf__ = proto.module(
    package='google.events.firebase.remoteconfig.v1',
    manifest={
        'RemoteConfigUpdateOrigin',
        'RemoteConfigUpdateType',
        'RemoteConfigEventData',
        'RemoteConfigUser',
    },
)


class RemoteConfigUpdateOrigin(proto.Enum):
    r"""What type of update was associated with the Remote Config
    template version.

    Values:
        REMOTE_CONFIG_UPDATE_ORIGIN_UNSPECIFIED (0):
            Catch-all for unrecognized values.
        CONSOLE (1):
            The update came from the Firebase UI.
        REST_API (2):
            The update came from the Remote Config REST
            API.
        ADMIN_SDK_NODE (3):
            The update came from the Firebase Admin Node
            SDK.
    """
    REMOTE_CONFIG_UPDATE_ORIGIN_UNSPECIFIED = 0
    CONSOLE = 1
    REST_API = 2
    ADMIN_SDK_NODE = 3


class RemoteConfigUpdateType(proto.Enum):
    r"""Where the Remote Config update action originated.

    Values:
        REMOTE_CONFIG_UPDATE_TYPE_UNSPECIFIED (0):
            Catch-all for unrecognized enum values.
        INCREMENTAL_UPDATE (1):
            A regular incremental update.
        FORCED_UPDATE (2):
            A forced update. The ETag was specified as "*" in an
            UpdateRemoteConfigRequest request or the "Force Update"
            button was pressed on the console.
        ROLLBACK (3):
            A rollback to a previous Remote Config
            template.
    """
    REMOTE_CONFIG_UPDATE_TYPE_UNSPECIFIED = 0
    INCREMENTAL_UPDATE = 1
    FORCED_UPDATE = 2
    ROLLBACK = 3


class RemoteConfigEventData(proto.Message):
    r"""The data within all Firebase Remote Config events.

    Attributes:
        version_number (int):
            The version number of the version's
            corresponding Remote Config template.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            When the Remote Config template was written
            to the Remote Config server.
        update_user (google.events.firebase.remoteconfig_v1.types.RemoteConfigUser):
            Aggregation of all metadata fields about the
            account that performed the  update.
        description (str):
            The user-provided description of the
            corresponding Remote Config template.
        update_origin (google.events.firebase.remoteconfig_v1.types.RemoteConfigUpdateOrigin):
            Where the update action originated.
        update_type (google.events.firebase.remoteconfig_v1.types.RemoteConfigUpdateType):
            What type of update was made.
        rollback_source (int):
            Only present if this version is the result of
            a rollback, and will be the version number of
            the Remote Config template that was rolled-back
            to.
    """

    version_number: int = proto.Field(
        proto.INT64,
        number=1,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=2,
        message=timestamp_pb2.Timestamp,
    )
    update_user: 'RemoteConfigUser' = proto.Field(
        proto.MESSAGE,
        number=3,
        message='RemoteConfigUser',
    )
    description: str = proto.Field(
        proto.STRING,
        number=4,
    )
    update_origin: 'RemoteConfigUpdateOrigin' = proto.Field(
        proto.ENUM,
        number=5,
        enum='RemoteConfigUpdateOrigin',
    )
    update_type: 'RemoteConfigUpdateType' = proto.Field(
        proto.ENUM,
        number=6,
        enum='RemoteConfigUpdateType',
    )
    rollback_source: int = proto.Field(
        proto.INT64,
        number=7,
    )


class RemoteConfigUser(proto.Message):
    r"""All the fields associated with the person/service account
    that wrote a Remote Config template.

    Attributes:
        name (str):
            Display name.
        email (str):
            Email address.
        image_url (str):
            Image URL.
    """

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    email: str = proto.Field(
        proto.STRING,
        number=2,
    )
    image_url: str = proto.Field(
        proto.STRING,
        number=3,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
