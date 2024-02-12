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
    package='google.events.cloud.pubsub.v1',
    manifest={
        'MessagePublishedData',
        'PubsubMessage',
    },
)


class MessagePublishedData(proto.Message):
    r"""The event data when a message is published to a topic.

    Attributes:
        message (google.events.cloud.pubsub_v1.types.PubsubMessage):
            The message that was published.
        subscription (str):
            The resource name of the subscription for which this event
            was generated. The format of the value is
            ``projects/{project-id}/subscriptions/{subscription-id}``.
    """

    message: 'PubsubMessage' = proto.Field(
        proto.MESSAGE,
        number=1,
        message='PubsubMessage',
    )
    subscription: str = proto.Field(
        proto.STRING,
        number=2,
    )


class PubsubMessage(proto.Message):
    r"""A message published to a topic.

    Attributes:
        data (bytes):
            The binary data in the message.
        attributes (MutableMapping[str, str]):
            Attributes for this message.
        message_id (str):
            ID of this message, assigned by the server
            when the message is published. Guaranteed to be
            unique within the topic.
        publish_time (google.protobuf.timestamp_pb2.Timestamp):
            The time at which the message was published, populated by
            the server when it receives the ``Publish`` call.
        ordering_key (str):
            If non-empty, identifies related messages for
            which publish order should be respected.
    """

    data: bytes = proto.Field(
        proto.BYTES,
        number=1,
    )
    attributes: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )
    message_id: str = proto.Field(
        proto.STRING,
        number=3,
    )
    publish_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=4,
        message=timestamp_pb2.Timestamp,
    )
    ordering_key: str = proto.Field(
        proto.STRING,
        number=5,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
