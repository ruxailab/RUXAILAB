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
Cloud functions to handle Firebase Performance Monitoring events from Firebase Alerts.
"""

import dataclasses as _dataclasses
import functools as _functools
import typing as _typing
import cloudevents.http as _ce
from firebase_functions.alerts import FirebaseAlertData

import firebase_functions.private.util as _util

from firebase_functions.core import T, CloudEvent
from firebase_functions.options import PerformanceOptions


@_dataclasses.dataclass(frozen=True)
class ThresholdAlertPayload:
    """
    The internal payload object for a performance threshold alert.
    Payload is wrapped inside a FirebaseAlertData object.
    """

    event_name: str
    """
    Name of the trace or network request this alert is for 
    (e.g. my_custom_trace, firebase.com/api/123).
    """

    event_type: str
    """
    The resource type this alert is for (i.e. trace, network request, 
    screen rendering, etc.).
    """

    metric_type: str
    """
    The metric type this alert is for (i.e. success rate, 
    response time, duration, etc.).
    """

    num_samples: int
    """
    The number of events checked for this alert condition.
    """

    threshold_value: float
    """
    The threshold value of the alert condition without units (e.g. "75", "2.1").
    """

    threshold_unit: str
    """
    The unit for the alert threshold (e.g. "percent", "seconds").
    """

    violation_value: float | int
    """
    The value that violated the alert condition (e.g. "76.5", "3").
    """

    violation_unit: str
    """
    The unit for the violation value (e.g. "percent", "seconds").
    """

    investigate_uri: str
    """
    The link to Firebase Console to investigate more into this alert.
    """

    condition_percentile: float | int | None = None
    """
    The percentile of the alert condition, can be 0 if percentile 
    is not applicable to the alert condition and omitted;
    range: [1, 100].
    """

    app_version: str | None = None
    """
    The app version this alert was triggered for, can be omitted 
    if the alert is for a network request (because the alert was 
    checked against data from all versions of app) or a web app
    (where the app is versionless).
    """


@_dataclasses.dataclass(frozen=True)
class PerformanceEvent(CloudEvent[FirebaseAlertData[T]]):
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


PerformanceThresholdAlertEvent = PerformanceEvent[ThresholdAlertPayload]
"""
The type of the event for 'on_threshold_alert_published' functions.
"""

OnThresholdAlertPublishedCallable = _typing.Callable[
    [PerformanceThresholdAlertEvent], None]
"""
The type of the callable for 'on_threshold_alert_published' functions.
"""


@_util.copy_func_kwargs(PerformanceOptions)
def on_threshold_alert_published(
    **kwargs
) -> _typing.Callable[[OnThresholdAlertPublishedCallable],
                      OnThresholdAlertPublishedCallable]:
    """
    Event handler which runs every time a threshold alert is received.

    Example:

    .. code-block:: python

      import firebase_functions.alerts.performance_fn as performance_fn   

      @performance_fn.on_threshold_alert_published()
      def example(alert: performance_fn.PerformanceThresholdAlertEvent) -> None:
          print(alert)

    :param \\*\\*kwargs: Options.
    :type \\*\\*kwargs: as :exc:`firebase_functions.options.PerformanceOptions`
    :rtype: :exc:`typing.Callable`
            \\[ 
            \\[ :exc:`firebase_functions.alerts.performance_fn.PerformanceThresholdAlertEvent` \\], 
            `None` 
            \\]
            A function that takes a PerformanceThresholdAlertEvent and returns None.
    """
    options = PerformanceOptions(**kwargs)

    def on_threshold_alert_published_inner_decorator(
            func: OnThresholdAlertPublishedCallable):

        @_functools.wraps(func)
        def on_threshold_alert_published_wrapped(raw: _ce.CloudEvent):
            from firebase_functions.private._alerts_fn import performance_event_from_ce
            func(performance_event_from_ce(raw))

        _util.set_func_endpoint_attr(
            on_threshold_alert_published_wrapped,
            options._endpoint(
                func_name=func.__name__,
                alert_type='performance.threshold',
            ),
        )
        return on_threshold_alert_published_wrapped

    return on_threshold_alert_published_inner_decorator
