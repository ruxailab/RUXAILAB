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
Cloud functions to handle events from Firebase Alerts.
Subpackages give stronger typing to specific services which
notify users via Firebase Alerts.
"""

import dataclasses as _dataclasses
import datetime as _dt
import typing as _typing

from firebase_functions.core import T


@_dataclasses.dataclass(frozen=True)
class FirebaseAlertData(_typing.Generic[T]):
    """
    The CloudEvent data emitted by Firebase Alerts.
    """

    create_time: _dt.datetime
    """
    The time the alert was created.
    """

    end_time: _dt.datetime | None
    """
    The time the alert ended. This is only set for alerts that have ended.
    """

    payload: T
    """
    Payload of the event, which includes the details of the specific alert.
    """
