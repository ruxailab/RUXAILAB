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
Public code that is shared across modules.
"""
import dataclasses as _dataclass
import datetime as _datetime
import typing as _typing

T = _typing.TypeVar("T")


@_dataclass.dataclass(frozen=True)
class CloudEvent(_typing.Generic[T]):
    """
    A CloudEvent is the base of a cross-platform format for encoding a serverless event.
    More information can be found at https://github.com/cloudevents/spec
    """

    specversion: str
    """
    Version of the CloudEvents spec for this event.
    """

    id: str
    """
    A globally unique ID for this event.
    """

    source: str
    """
    The resource which published this event.
    """

    type: str
    """
    The type of event that this represents.
    """

    time: _datetime.datetime
    """
    When this event occurred.
    """

    data: T
    """
    Information about this specific event.
    """

    subject: str | None
    """
    The resource, provided by source, that this event relates to.
    """


@_dataclass.dataclass(frozen=True)
class Change(_typing.Generic[T]):
    """
    The Cloud Functions interface for events that change state, such as
    Realtime Database `on_value_written`.
    """

    before: T
    """
    The state of data before the change.
    """

    after: T
    """
    The state of data after the change.
    """
