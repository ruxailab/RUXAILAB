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
    package='google.events.cloud.workflows.v1',
    manifest={
        'Workflow',
        'WorkflowEventData',
    },
)


class Workflow(proto.Message):
    r"""Workflow program to be executed by Workflows.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        name (str):
            The resource name of the workflow.
            Format:
            projects/{project}/locations/{location}/workflows/{workflow}
        description (str):
            Description of the workflow provided by the
            user. Must be at most 1000 unicode characters
            long.
        state (google.events.cloud.workflows_v1.types.Workflow.State):
            Output only. State of the workflow
            deployment.
        revision_id (str):
            Output only. The revision of the workflow. A new revision of
            a workflow is created as a result of updating the following
            properties of a workflow:

            -  [Service
               account][google.cloud.workflows.v1.Workflow.service_account]
            -  [Workflow code to be
               executed][google.cloud.workflows.v1.Workflow.source_contents]

            The format is "000001-a4d", where the first 6 characters
            define the zero-padded revision ordinal number. They are
            followed by a hyphen and 3 hexadecimal random characters.
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The timestamp of when the
            workflow was created.
        update_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The last update timestamp of the
            workflow.
        revision_create_time (google.protobuf.timestamp_pb2.Timestamp):
            Output only. The timestamp that the latest
            revision of the workflow was created.
        labels (MutableMapping[str, str]):
            Labels associated with this workflow.
            Labels can contain at most 64 entries. Keys and
            values can be no longer than 63 characters and
            can only contain lowercase letters, numeric
            characters, underscores and dashes. Label keys
            must start with a letter. International
            characters are allowed.
        service_account (str):
            The service account associated with the latest workflow
            version. This service account represents the identity of the
            workflow and determines what permissions the workflow has.
            Format: projects/{project}/serviceAccounts/{account} or
            {account}

            Using ``-`` as a wildcard for the ``{project}`` or not
            providing one at all will infer the project from the
            account. The ``{account}`` value can be the ``email``
            address or the ``unique_id`` of the service account.

            If not provided, workflow will use the project's default
            service account. Modifying this field for an existing
            workflow results in a new workflow revision.
        source_contents (str):
            Workflow code to be executed. The size limit
            is 128KB.

            This field is a member of `oneof`_ ``source_code``.
    """
    class State(proto.Enum):
        r"""Describes the current state of workflow deployment. More
        states may be added in the future.

        Values:
            STATE_UNSPECIFIED (0):
                Invalid state.
            ACTIVE (1):
                The workflow has been deployed successfully
                and is serving.
        """
        STATE_UNSPECIFIED = 0
        ACTIVE = 1

    name: str = proto.Field(
        proto.STRING,
        number=1,
    )
    description: str = proto.Field(
        proto.STRING,
        number=2,
    )
    state: State = proto.Field(
        proto.ENUM,
        number=3,
        enum=State,
    )
    revision_id: str = proto.Field(
        proto.STRING,
        number=4,
    )
    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=5,
        message=timestamp_pb2.Timestamp,
    )
    update_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=6,
        message=timestamp_pb2.Timestamp,
    )
    revision_create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=7,
        message=timestamp_pb2.Timestamp,
    )
    labels: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=8,
    )
    service_account: str = proto.Field(
        proto.STRING,
        number=9,
    )
    source_contents: str = proto.Field(
        proto.STRING,
        number=10,
        oneof='source_code',
    )


class WorkflowEventData(proto.Message):
    r"""The data within all Workflow events.

    .. _oneof: https://proto-plus-python.readthedocs.io/en/stable/fields.html#oneofs-mutually-exclusive-fields

    Attributes:
        payload (google.events.cloud.workflows_v1.types.Workflow):
            Optional. The Workflow event payload. Unset
            for deletion events.

            This field is a member of `oneof`_ ``_payload``.
    """

    payload: 'Workflow' = proto.Field(
        proto.MESSAGE,
        number=1,
        optional=True,
        message='Workflow',
    )


__all__ = tuple(sorted(__protobuf__.manifest))
