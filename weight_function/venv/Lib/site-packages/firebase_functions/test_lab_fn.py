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
# pylint: disable=protected-access
"""
Cloud functions to handle Test Lab events.
"""
import dataclasses as _dataclasses
import functools as _functools
import datetime as _dt
import typing as _typing
import cloudevents.http as _ce
import enum as _enum

import firebase_functions.private.util as _util

from firebase_functions.core import CloudEvent
from firebase_functions.options import EventHandlerOptions


class TestState(str, _enum.Enum):
    """
    Possible test states for a test matrix.
    """

    TEST_STATE_UNSPECIFIED = "TEST_STATE_UNSPECIFIED"
    """
    The default value. This value is used if the state is omitted.
    """

    VALIDATING = "VALIDATING"
    """
    The test matrix is being validated.
    """

    PENDING = "PENDING"
    """
    The test matrix is waiting for resources to become available.
    """

    FINISHED = "FINISHED"
    """
    The test matrix has completed normally.
    """

    ERROR = "ERROR"
    """
    The test matrix has completed because of an infrastructure failure.
    """

    INVALID = "INVALID"
    """
    The test matrix was not run because the provided inputs are not valid.
    """


class OutcomeSummary(str, _enum.Enum):
    """
    Outcome summary for a finished test matrix.
    """

    OUTCOME_SUMMARY_UNSPECIFIED = "OUTCOME_SUMMARY_UNSPECIFIED"
    """
    The default value. This value is used if the state is omitted.
    """

    SUCCESS = "SUCCESS"
    """
    The test matrix run was successful, for instance:
    - All test cases passed.
    - No crash of the application under test was detected.
    """

    FAILURE = "FAILURE"
    """
    A run failed, for instance:
    - One or more test case failed.
    - A test timed out.
    - The application under test crashed.
    """

    INCONCLUSIVE = "INCONCLUSIVE"
    """
    Something unexpected happened. The test run should still be considered
    unsuccessful but this is likely a transient problem and re-running the
    test might be successful.
    """

    SKIPPED = "SKIPPED"
    """
    All tests were skipped.
    """


@_dataclasses.dataclass(frozen=True)
class ResultStorage:
    """
    Locations where test results are stored.
    """

    tool_results_history: str
    """
    Tool Results history resource containing test results. Format is
    `projects/{project_id}/histories/{history_id}`.
    See https://firebase.google.com/docs/test-lab/reference/toolresults/rest
    for more information.
    """

    results_uri: str
    """
    URI to the test results in the Firebase Web Console.
    """

    gcs_path: str
    """
    Location in Google Cloud Storage where test results are written to.
    In the form "gs://bucket/path/to/somewhere".
    """

    tool_results_execution: str | None = None
    """
    Tool Results execution resource containing test results. Format is
    `projects/{project_id}/histories/{history_id}/executions/{execution_id}`.
    Optional, can be omitted in erroneous test states.
    See https://firebase.google.com/docs/test-lab/reference/toolresults/rest
    for more information.
    """


@_dataclasses.dataclass(frozen=True)
class ClientInfo:
    """
    Information about the client which invoked the test.
    """

    client: str
    """
    Client name, such as "gcloud".
    """

    details: dict[str, str]
    """
    Map of detailed information about the client.
    """


@_dataclasses.dataclass(frozen=True)
class TestMatrixCompletedData:
    """
    The data within all Firebase test matrix completed events.
    """

    create_time: _dt.datetime
    """
    Time the test matrix was created.
    """

    state: TestState
    """
    State of the test matrix.
    """

    invalid_matrix_details: str | None
    """
    Code that describes why the test matrix is considered invalid. Only set for
    matrices in the INVALID state.
    """

    outcome_summary: OutcomeSummary
    """
    Outcome summary of the test matrix.
    """

    result_storage: ResultStorage
    """
    Locations where test results are stored.
    """

    client_info: ClientInfo
    """
    Information provided by the client that created the test matrix.
    """

    test_matrix_id: str
    """
    ID of the test matrix this event belongs to.
    """


_E1 = CloudEvent[TestMatrixCompletedData]
_C1 = _typing.Callable[[_E1], None]


def _event_handler(func: _C1, raw: _ce.CloudEvent) -> None:
    event_attributes = raw._get_attributes()
    event_data: _typing.Any = raw.get_data()
    event_dict = {**event_data, **event_attributes}

    test_lab_data = TestMatrixCompletedData(
        create_time=_dt.datetime.strptime(event_data["createTime"],
                                          "%Y-%m-%dT%H:%M:%S.%f%z"),
        state=TestState(event_data["state"]),
        invalid_matrix_details=event_data.get("invalidMatrixDetails"),
        outcome_summary=OutcomeSummary(event_data["outcomeSummary"]),
        result_storage=ResultStorage(
            tool_results_history=event_data["resultStorage"]
            ["toolResultsHistory"],
            results_uri=event_data["resultStorage"]["resultsUri"],
            gcs_path=event_data["resultStorage"]["gcsPath"],
            tool_results_execution=event_data["resultStorage"].get(
                "toolResultsExecution"),
        ),
        client_info=ClientInfo(
            client=event_data["clientInfo"]["client"],
            details=event_data["clientInfo"].get("details", {}),
        ),
        test_matrix_id=event_data["testMatrixId"],
    )

    event: CloudEvent[TestMatrixCompletedData] = CloudEvent(
        data=test_lab_data,
        id=event_dict["id"],
        source=event_dict["source"],
        specversion=event_dict["specversion"],
        subject=event_dict["subject"] if "subject" in event_dict else None,
        time=_dt.datetime.strptime(
            event_dict["time"],
            "%Y-%m-%dT%H:%M:%S.%f%z",
        ),
        type=event_dict["type"],
    )

    func(event)


@_util.copy_func_kwargs(EventHandlerOptions)
def on_test_matrix_completed(**kwargs) -> _typing.Callable[[_C1], _C1]:
    """
    Event handler which triggers when a Firebase test matrix completes.

    Example:

    .. code-block:: python

      @on_test_matrix_completed()
      def example(event: CloudEvent[ConfigUpdateData]) -> None:
          pass

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.EventHandlerOptions`
    :rtype: :exc:`typing.Callable`
            \\[ \\[ :exc:`firebase_functions.core.CloudEvent` \\[
            :exc:`firebase_functions.test_lab_fn.TestMatrixCompletedData` \\[
            :exc:`typing.Any` \\] \\] \\], `None` \\]
            A function that takes a CloudEvent and returns None.
    """
    options = EventHandlerOptions(**kwargs)

    def on_test_matrix_completed_inner_decorator(func: _C1):

        @_functools.wraps(func)
        def on_test_matrix_completed_wrapped(raw: _ce.CloudEvent):
            return _event_handler(func, raw)

        _util.set_func_endpoint_attr(
            on_test_matrix_completed_wrapped,
            options._endpoint(
                func_name=func.__name__,
                event_filters={},
                event_type="google.firebase.testlab.testMatrix.v1.completed"),
        )
        return on_test_matrix_completed_wrapped

    return on_test_matrix_completed_inner_decorator
