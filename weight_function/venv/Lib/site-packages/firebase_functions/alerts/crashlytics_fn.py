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
# pylint: disable=protected-access,line-too-long
"""
Cloud functions to handle Crashlytics events from Firebase Alerts.
"""
import dataclasses as _dataclasses
import typing as _typing
import cloudevents.http as _ce
import datetime as _dt
import functools as _functools
from firebase_functions.alerts import FirebaseAlertData
from firebase_functions.core import T, CloudEvent
from firebase_functions.options import CrashlyticsOptions
import firebase_functions.private.util as _util


@_dataclasses.dataclass(frozen=True)
class Issue:
    """
    Generic Crashlytics issue interface
    """

    id: str
    """
    The ID of the Crashlytics issue
    """

    title: str
    """
    The title of the Crashlytics issue
    """

    subtitle: str
    """
    The subtitle of the Crashlytics issue
    """

    app_version: str
    """
    The application version of the Crashlytics issue
    """


@_dataclasses.dataclass(frozen=True)
class NewFatalIssuePayload:
    """
    The internal payload object for a new fatal issue.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    issue: Issue
    """
    Basic information of the Crashlytics issue
    """


@_dataclasses.dataclass(frozen=True)
class NewNonfatalIssuePayload:
    """
    The internal payload object for a new non-fatal issue.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    issue: Issue
    """
    Basic information of the Crashlytics issue
    """


@_dataclasses.dataclass(frozen=True)
class RegressionAlertPayload:
    """
    The internal payload object for a regression alert.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    type: str
    """
    The type of the Crashlytics issue, e.g. new fatal, new nonfatal, ANR
    """

    issue: Issue
    """
    Basic information of the Crashlytics issue
    """

    resolve_time: _dt.datetime
    """
    The time that the Crashlytics issues was most recently resolved before it
    began to reoccur.
    """


@_dataclasses.dataclass(frozen=True)
class TrendingIssueDetails:
    """
    Generic Crashlytics trending issue interface
    """

    type: str
    """
    The type of the Crashlytics issue, e.g. new fatal, new nonfatal, ANR
    """

    issue: Issue
    """
    Basic information of the Crashlytics issue
    """

    event_count: int
    """
    The number of crashes that occurred with the issue
    """

    user_count: int
    """
    The number of distinct users that were affected by the issue
    """


@_dataclasses.dataclass(frozen=True)
class StabilityDigestPayload:
    """
    The internal payload object for a stability digest.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    digest_date: _dt.datetime
    """
    The date that the digest gets created. Issues in the digest should have the
    same date as the digest date
    """

    trending_issues: list[TrendingIssueDetails]
    """
    A stability digest containing several trending Crashlytics issues
    """


@_dataclasses.dataclass(frozen=True)
class VelocityAlertPayload:
    """
    The internal payload object for a velocity alert.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    issue: Issue
    """
    Basic information of the Crashlytics issue
    """

    create_time: _dt.datetime
    """
    The time that the Crashlytics issue gets created
    """

    crash_count: int
    """
    The number of user sessions for the given app version that had this
    specific crash issue in the time period used to trigger the velocity alert.
    """

    crash_percentage: float
    """
    The percentage of user sessions for the given app version that had this
    specific crash issue in the time period used to trigger the velocity alert.
    """

    first_version: str
    """
    The first app version where this issue was seen, and not necessarily the
    version that has triggered the alert.
    """


@_dataclasses.dataclass(frozen=True)
class NewAnrIssuePayload:
    """
    The internal payload object for a new Application Not Responding issue.
    Payload is wrapped inside a `FirebaseAlertData` object.
    """

    issue: Issue
    """
    Basic information of the Crashlytics issue
    """


@_dataclasses.dataclass(frozen=True)
class CrashlyticsEvent(CloudEvent[FirebaseAlertData[T]]):
    """
    A custom CloudEvent for billing Firebase Alerts.
    """

    alert_type: str
    """
    The type of the alerts that got triggered.
    """

    app_id: str
    """
    The Firebase App ID that's associated with the alert.
    """


CrashlyticsNewFatalIssueEvent = CrashlyticsEvent[NewFatalIssuePayload]
"""
The type of the event for 'on_new_fatal_issue_published' functions.
"""

OnNewFatalIssuePublishedCallable = _typing.Callable[
    [CrashlyticsNewFatalIssueEvent], None]
"""
The type of the callable for 'on_new_fatal_issue_published' functions.
"""

CrashlyticsNewNonfatalIssueEvent = CrashlyticsEvent[NewNonfatalIssuePayload]
"""
The type of the event for 'on_new_nonfatal_issue_published' functions.
"""

OnNewNonfatalIssuePublishedCallable = _typing.Callable[
    [CrashlyticsNewNonfatalIssueEvent], None]
"""
The type of the callable for 'on_new_nonfatal_issue_published' functions.
"""

CrashlyticsRegressionAlertEvent = CrashlyticsEvent[RegressionAlertPayload]
"""
The type of the event for 'on_regression_alert_published' functions.
"""

OnRegressionAlertPublishedCallable = _typing.Callable[
    [CrashlyticsRegressionAlertEvent], None]
"""
The type of the callable for 'on_regression_alert_published' functions.
"""

CrashlyticsStabilityDigestEvent = CrashlyticsEvent[StabilityDigestPayload]
"""
The type of the event for 'on_stability_digest_published' functions.
"""

OnStabilityDigestPublishedCallable = _typing.Callable[
    [CrashlyticsStabilityDigestEvent], None]
"""
The type of the callable for 'on_stability_digest_published' functions.
"""

CrashlyticsVelocityAlertEvent = CrashlyticsEvent[VelocityAlertPayload]
"""
The type of the event for 'on_velocity_alert_published' functions.
"""

OnVelocityAlertPublishedCallable = _typing.Callable[
    [CrashlyticsVelocityAlertEvent], None]
"""
The type of the callable for 'on_velocity_alert_published' functions.
"""

CrashlyticsNewAnrIssueEvent = CrashlyticsEvent[NewAnrIssuePayload]
"""
The type of the event for 'on_new_anr_issue_published' functions.
"""

OnNewAnrIssuePublishedCallable = _typing.Callable[[CrashlyticsNewAnrIssueEvent],
                                                  None]
"""
The type of the callable for 'on_new_anr_issue_published' functions.
"""


def _create_crashlytics_decorator(
    alert_type: str,
    **kwargs,
) -> _typing.Callable:
    options = CrashlyticsOptions(**kwargs)

    def crashlytics_decorator_inner(func: _typing.Callable):

        @_functools.wraps(func)
        def crashlytics_decorator_wrapped(raw: _ce.CloudEvent):
            from firebase_functions.private._alerts_fn import crashlytics_event_from_ce
            func(crashlytics_event_from_ce(raw))

        _util.set_func_endpoint_attr(
            crashlytics_decorator_wrapped,
            options._endpoint(
                func_name=func.__name__,
                alert_type=alert_type,
            ),
        )
        return crashlytics_decorator_wrapped

    return crashlytics_decorator_inner


@_util.copy_func_kwargs(CrashlyticsOptions)
def on_new_fatal_issue_published(
    **kwargs
) -> _typing.Callable[[OnNewFatalIssuePublishedCallable],
                      OnNewFatalIssuePublishedCallable]:
    """
    Event handler which runs every time a new fatal issue is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.crashlytics_fn as crashlytics_fn

      @crashlytics_fn.on_new_fatal_issue_published()
      def example(alert: crashlytics_fn.CrashlyticsNewFatalIssueEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.CrashlyticsOptions`
    :rtype: :exc:`typing.Callable`
            \\[
            \\[ :exc:`firebase_functions.alerts.crashlytics_fn.CrashlyticsNewFatalIssueEvent` \\],
            `None`
            \\]
            A function that takes a CrashlyticsNewFatalIssueEvent and returns None.
    """
    return _create_crashlytics_decorator('crashlytics.newFatalIssue', **kwargs)


@_util.copy_func_kwargs(CrashlyticsOptions)
def on_new_nonfatal_issue_published(
    **kwargs
) -> _typing.Callable[[OnNewNonfatalIssuePublishedCallable],
                      OnNewNonfatalIssuePublishedCallable]:
    """
    Event handler which runs every time a new nonfatal issue is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.crashlytics_fn as crashlytics_fn

      @crashlytics_fn.on_new_nonfatal_issue_published()
      def example(alert: crashlytics_fn.CrashlyticsNewNonfatalIssueEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.CrashlyticsOptions`
    :rtype: :exc:`typing.Callable`
            \\[
            \\[ :exc:`firebase_functions.alerts.crashlytics_fn.CrashlyticsNewNonfatalIssueEvent` \\],
            `None`
            \\]
            A function that takes a CrashlyticsNewNonfatalIssueEvent and returns None.
    """
    return _create_crashlytics_decorator('crashlytics.newNonfatalIssue',
                                         **kwargs)


@_util.copy_func_kwargs(CrashlyticsOptions)
def on_regression_alert_published(
    **kwargs
) -> _typing.Callable[[OnRegressionAlertPublishedCallable],
                      OnRegressionAlertPublishedCallable]:
    """
    Event handler which runs every time a regression alert is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.crashlytics_fn as crashlytics_fn

      @crashlytics_fn.on_regression_alert_published()
      def example(alert: crashlytics_fn.CrashlyticsRegressionAlertEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.CrashlyticsOptions`
    :rtype: :exc:`typing.Callable`
            \\[
            \\[ :exc:`firebase_functions.alerts.crashlytics_fn.CrashlyticsRegressionAlertEvent` \\],
            `None`
            \\]
            A function that takes a CrashlyticsRegressionAlertEvent and returns None.
    """
    return _create_crashlytics_decorator('crashlytics.regression', **kwargs)


@_util.copy_func_kwargs(CrashlyticsOptions)
def on_stability_digest_published(
    **kwargs
) -> _typing.Callable[[OnStabilityDigestPublishedCallable],
                      OnStabilityDigestPublishedCallable]:
    """
    Event handler which runs every time a stability digest is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.crashlytics_fn as crashlytics_fn

      @crashlytics_fn.on_stability_digest_published()
      def example(alert: crashlytics_fn.CrashlyticsStabilityDigestEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.CrashlyticsOptions`
    :rtype: :exc:`typing.Callable`
            \\[
            \\[ :exc:`firebase_functions.alerts.crashlytics_fn.CrashlyticsStabilityDigestEvent` \\],
            `None`
            \\]
            A function that takes a CrashlyticsStabilityDigestEvent and returns None.
    """
    return _create_crashlytics_decorator('crashlytics.stabilityDigest',
                                         **kwargs)


@_util.copy_func_kwargs(CrashlyticsOptions)
def on_velocity_alert_published(
    **kwargs
) -> _typing.Callable[[OnVelocityAlertPublishedCallable],
                      OnVelocityAlertPublishedCallable]:
    """
    Event handler which runs every time a velocity alert is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.crashlytics_fn as crashlytics_fn

      @crashlytics_fn.on_velocity_alert_published()
      def example(alert: crashlytics_fn.CrashlyticsVelocityAlertEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.CrashlyticsOptions`
    :rtype: :exc:`typing.Callable`
            \\[
            \\[ :exc:`firebase_functions.alerts.crashlytics_fn.CrashlyticsVelocityAlertEvent` \\],
            `None`
            \\]
            A function that takes a CrashlyticsVelocityAlertEvent and returns None.
    """
    return _create_crashlytics_decorator('crashlytics.velocity', **kwargs)


@_util.copy_func_kwargs(CrashlyticsOptions)
def on_new_anr_issue_published(
    **kwargs
) -> _typing.Callable[[OnNewAnrIssuePublishedCallable],
                      OnNewAnrIssuePublishedCallable]:
    """
    Event handler which runs every time a new ANR issue is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.crashlytics_fn as crashlytics_fn

      @crashlytics_fn.on_new_anr_issue_published()
      def example(alert: crashlytics_fn.CrashlyticsNewAnrIssueEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.CrashlyticsOptions`
    :rtype: :exc:`typing.Callable`
            \\[
            \\[ :exc:`firebase_functions.alerts.crashlytics_fn.CrashlyticsNewAnrIssueEvent` \\],
            `None`
            \\]
            A function that takes a CrashlyticsNewAnrIssueEvent and returns None.
    """
    return _create_crashlytics_decorator('crashlytics.newAnrIssue', **kwargs)
