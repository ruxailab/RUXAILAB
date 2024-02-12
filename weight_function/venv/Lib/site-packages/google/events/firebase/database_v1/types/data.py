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


__protobuf__ = proto.module(
    package='google.events.firebase.database.v1',
    manifest={
        'ReferenceEventData',
    },
)


class ReferenceEventData(proto.Message):
    r"""The data within all Firebase Real Time Database reference
    events.

    Attributes:
        data (google.protobuf.struct_pb2.Value):
            The original data for the reference.
        delta (google.protobuf.struct_pb2.Value):
            The change in the reference data.
    """

    data: struct_pb2.Value = proto.Field(
        proto.MESSAGE,
        number=1,
        message=struct_pb2.Value,
    )
    delta: struct_pb2.Value = proto.Field(
        proto.MESSAGE,
        number=2,
        message=struct_pb2.Value,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
