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
    package='google.events.firebase.testlab.v1',
    manifest={
        'TestState',
        'OutcomeSummary',
        'TestMatrixEventData',
        'ClientInfo',
        'ResultStorage',
    },
)


class TestState(proto.Enum):
    r"""Possible test states for a test matrix.

    Values:
        TEST_STATE_UNSPECIFIED (0):
            The default value. This value is used if the
            state is omitted.
        VALIDATING (1):
            The test matrix is being validated.
        PENDING (2):
            The test matrix is waiting for resources to
            become available.
        FINISHED (3):
            The test matrix has completed normally.
        ERROR (4):
            The test matrix has completed because of an
            infrastructure failure.
        INVALID (5):
            The test matrix was not run because the
            provided inputs are not valid.
    """
    TEST_STATE_UNSPECIFIED = 0
    VALIDATING = 1
    PENDING = 2
    FINISHED = 3
    ERROR = 4
    INVALID = 5


class OutcomeSummary(proto.Enum):
    r"""Outcome summary for a finished test matrix.

    Values:
        OUTCOME_SUMMARY_UNSPECIFIED (0):
            The default value. This value is used if the
            state is omitted.
        SUCCESS (1):
            The test matrix run was successful, for
            instance:

            - All test cases passed.
            - No crash of the application under test was
              detected.
        FAILURE (2):
            A run failed, for instance:

            - One or more test case failed.
            - A test timed out.
            - The application under test crashed.
        INCONCLUSIVE (3):
            Something unexpected happened. The test run
            should still be considered unsuccessful but this
            is likely a transient problem and re-running the
            test might be successful.
        SKIPPED (4):
            All tests were skipped.
    """
    OUTCOME_SUMMARY_UNSPECIFIED = 0
    SUCCESS = 1
    FAILURE = 2
    INCONCLUSIVE = 3
    SKIPPED = 4


class TestMatrixEventData(proto.Message):
    r"""The data within all Firebase test matrix events.

    Attributes:
        create_time (google.protobuf.timestamp_pb2.Timestamp):
            Time the test matrix was created.
        state (google.events.firebase.testlab_v1.types.TestState):
            State of the test matrix.
        invalid_matrix_details (str):
            Code that describes why the test matrix is
            considered invalid. Only set for matrices in the
            INVALID state.
        outcome_summary (google.events.firebase.testlab_v1.types.OutcomeSummary):
            Outcome summary of the test matrix.
        result_storage (google.events.firebase.testlab_v1.types.ResultStorage):
            Locations where test results are stored.
        client_info (google.events.firebase.testlab_v1.types.ClientInfo):
            Information provided by the client that
            created the test matrix.
        test_matrix_id (str):
            ID of the test matrix this event belongs to.
    """

    create_time: timestamp_pb2.Timestamp = proto.Field(
        proto.MESSAGE,
        number=1,
        message=timestamp_pb2.Timestamp,
    )
    state: 'TestState' = proto.Field(
        proto.ENUM,
        number=2,
        enum='TestState',
    )
    invalid_matrix_details: str = proto.Field(
        proto.STRING,
        number=3,
    )
    outcome_summary: 'OutcomeSummary' = proto.Field(
        proto.ENUM,
        number=4,
        enum='OutcomeSummary',
    )
    result_storage: 'ResultStorage' = proto.Field(
        proto.MESSAGE,
        number=5,
        message='ResultStorage',
    )
    client_info: 'ClientInfo' = proto.Field(
        proto.MESSAGE,
        number=6,
        message='ClientInfo',
    )
    test_matrix_id: str = proto.Field(
        proto.STRING,
        number=7,
    )


class ClientInfo(proto.Message):
    r"""Information about the client which invoked the test.

    Attributes:
        client (str):
            Client name, such as "gcloud".
        details (MutableMapping[str, str]):
            Map of detailed information about the client.
    """

    client: str = proto.Field(
        proto.STRING,
        number=1,
    )
    details: MutableMapping[str, str] = proto.MapField(
        proto.STRING,
        proto.STRING,
        number=2,
    )


class ResultStorage(proto.Message):
    r"""Locations where test results are stored.

    Attributes:
        tool_results_history (str):
            Tool Results history resource containing test results.
            Format is ``projects/{project_id}/histories/{history_id}``.
            See
            https://firebase.google.com/docs/test-lab/reference/toolresults/rest
            for more information.
        tool_results_execution (str):
            Tool Results execution resource containing test results.
            Format is
            ``projects/{project_id}/histories/{history_id}/executions/{execution_id}``.
            Optional, can be omitted in erroneous test states. See
            https://firebase.google.com/docs/test-lab/reference/toolresults/rest
            for more information.
        results_uri (str):
            URI to the test results in the Firebase Web
            Console.
        gcs_path (str):
            Location in Google Cloud Storage where test
            results are written to. In the form
            "gs://bucket/path/to/somewhere".
    """

    tool_results_history: str = proto.Field(
        proto.STRING,
        number=1,
    )
    tool_results_execution: str = proto.Field(
        proto.STRING,
        number=2,
    )
    results_uri: str = proto.Field(
        proto.STRING,
        number=3,
    )
    gcs_path: str = proto.Field(
        proto.STRING,
        number=4,
    )


__all__ = tuple(sorted(__protobuf__.manifest))
